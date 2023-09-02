const sgMail = require('@sendgrid/mail')
var htmlToPdf = require('html-pdf-node')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const handlebars = require('handlebars')
const InvoiceManagement = require('../models/InvoiceManagement')
const ScheduleEmail = require('../models/ScheduleEmail')
const ScheduleSms = require('../models/ScheduleSms')
const Setting = require('../models/Setting')

const emailSchedule = async () => {
  const emails = await ScheduleEmail.find()
  const setting = await Setting.findOne()
  sgMail.setApiKey(
    setting !== null && setting.sendGridApiKey !== ''
      ? setting.sendGridApiKey
      : process.env.SENDGRID_API_KEY
  )
  for (const email of emails) {
    console.log(email)
    const invoice = await InvoiceManagement.findById(
      email.scheduleId
    ).populate(['companyId', 'bankId'])
    console.log(invoice)
    const logoUrl = invoice?.companyId
      ? `http://localhost/upload/invoices/${invoice?.companyId?.companyLogo}`
      : `http://localhost/upload/invoices/invoice.png`
    let attachments = [
        {
            content: fs
            .readFileSync(`upload/pdfs/${invoice?.pdf}`)
            .toString('base64'),
            type: 'application/pdf',
            filename: 'invoice.pdf',
            disposition: 'attachment'
        }
    ]

    const invoiceEmailTemplate = fs.readFileSync(
        path.join(__dirname, '../controllers/invoiceEmail.ejs'),
        'utf-8'
        )
        const invoiceParams = {
            logoUrl: logoUrl,
            clientName: invoice.clientName,
            invoiceNo: invoice.invoiceNumber,
            issuedDate: moment(invoice.issuedDate).format('DD/MM/YYYY'),
            dueDate: moment(invoice.dueDate).format('DD/MM/YYYY'),
            descriptions: invoice.description,
      totalAmount: Number(invoice.totalAmount).toFixed(2),
      paymentLink: logoUrl
    }
    
    const compiledInvoiceEmailTemplate =
    handlebars.compile(invoiceEmailTemplate)
    const invoiceEmailHtml = compiledInvoiceEmailTemplate(invoiceParams)
    console.log(invoice.clientEmail)
    await sgMail.send({
        to: invoice.clientEmail,
        from: setting !== null && setting.sendGridUser !== '' ? setting.sendGridUser : process.env.SENDGRID_USER,
        subject: 'Your Invoice is currently pending payment.',
        html: invoiceEmailHtml,
        attachments: attachments
    })
    let count = email.sendCount + 1
    fs.appendFileSync(
        path.join(__dirname, '/../../log.txt'),
        `To : ${invoice.clientEmail} (${moment().toDate()}) ${count}th\n`
        )
        const updateCountNumber = await ScheduleEmail.findByIdAndUpdate(email._id, {
            sendCount: count
        })
    }
}

const smsSchedule = async () => {
  const smss = await ScheduleSms.find()
  const setting = await Setting.findOne()
  for (const sms of smss) {
    const invoice = await InvoiceManagement.findById(sms.scheduleId).populate([
      'companyId',
      'bankId'
    ])
    const setting = await Setting.findOne()
    const TWILIO_API_KEY = setting !== null && setting.twilloApiKey !== '' ? setting.twilloApiKey : process.env.TWILLO_API_KEY
    const TWILIO_API_SECRET_KEY = setting !== null && setting.twilloApiSecretKey !== '' ? setting.twilloApiSecretKey : process.env.TWILLO_API_SECRET_KEY
    const TWILIO_PHONE = setting !== null && setting.twilloPhone !== '' ? setting.twilloPhone : process.env.TWILLO_PHONE
    const twilio = require('twilio')(TWILIO_API_KEY, TWILIO_API_SECRET_KEY)
    let content = ''
    content += `Dear ${invoice?.clientName}\r\n\r\n`
    content += `Kindly find attached the invoice, Please make the payment using the following link.\r\n\r\n`
    content += `${req.protocol}://${req.headers.host}/invoice-payment?id=${invoice?._id.toString()}\r\n\r\n`
    content += `Invoice No: #${invoice?.invoiceNumber}\r\n`
    content += `Invoice Date: ${moment(invoice?.issuedDate).format(
      'DD/MM/YYYY'
    )}\r\n`
    content += `Description:\r\n`
    for (let description of invoice?.description) {
      content += `  ${description.content} - £${description.unitPrice}\r\n`
    }
    content += `Due Date: ${moment(invoice?.dueDate).format('DD/MM/YYYY')}\r\n`
    content += `Amount Due: £${invoice?.totalAmount}\r\n\r\n`
    content += `Kindly note that if you are doing bank transfer then please ensure that you include the invoice number.\r\n\r\n`
    if (invoice?.bankId?._id) {
      content += `Bank account details:\r\n`
      content += `  Beneficiary Name: ${invoice?.bankId?.beneficiary}\r\n`
      content += `  Account No: ${invoice?.bankId?.accountNo}\r\n`
      content += `  Sort Code: ${invoice?.bankId?.sortCode}\r\n\r\n`
    }
    content += `Best regards\r\n`
    content += `${invoice?.companyId?.companyName}\r\n\r\n`
    content += `${req.protocol}://${req.headers.host}/upload/pdfs/${invoice?.pdf}`

    const result = await twilio.messages.create({
      body: content,
      from: `+${TWILIO_PHONE}`,
      to: phone
    })
  }
}

module.exports = {
    emailSchedule,
    smsSchedule
}
