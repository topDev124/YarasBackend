const sgMail = require('@sendgrid/mail')
var htmlToPdf = require('html-pdf-node')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const momentTimeZone = require('moment-timezone')
const handlebars = require('handlebars')
const InvoiceManagement = require('../models/InvoiceManagement')
const History = require('../models/History')
const Setting = require('../models/Setting')

const emailSchedule = async () => {
  console.log('================', moment().toDate())
  const emails = await InvoiceManagement.find({
    emailScheduleDate: {
      $gte: moment().toDate(),
      $lt: moment().add(1, 'h').toDate()
    },
    emailScheduleStatus: true
  }).populate(['companyId', 'bankId'])
  console.log('emails========>', emails)
  const setting = await Setting.findOne()
  sgMail.setApiKey(
    setting !== null && setting.sendGridApiKey !== ''
      ? setting.sendGridApiKey
      : process.env.SENDGRID_API_KEY
  )
  for (const email of emails) {
    const logoUrl = email?.companyId
      ? `http://localhost/upload/invoices/${email?.companyId?.companyLogo}`
      : `http://localhost/upload/invoices/invoice.png`
    let attachments = [
      {
        content: fs
          .readFileSync(`upload/pdfs/${email?.pdf}`)
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
      clientName: email?.clientName,
      invoiceNo: email?.invoiceNumber,
      issuedDate: moment(email?.issuedDate).format('DD/MM/YYYY'),
      dueDate: moment(email?.dueDate).format('DD/MM/YYYY'),
      descriptions: email?.description,
      totalAmount: Number(email?.totalAmount).toFixed(2),
      paymentLink: `http://localhost/invoice-payment?id=${email?._id}`
    }

    const compiledInvoiceEmailTemplate =
      handlebars.compile(invoiceEmailTemplate)
    const invoiceEmailHtml = compiledInvoiceEmailTemplate(invoiceParams)
    await sgMail.send({
      to: email?.clientEmail,
      from:
        setting !== null && setting.sendGridUser !== ''
          ? setting.sendGridUser
          : process.env.SENDGRID_USER,
      subject: 'Your Invoice is currently pending payment.',
      html: invoiceEmailHtml,
      attachments: attachments
    })
    await History.create({
      historyTo: email?.clientEmail,
      historyType: 'Email',
      historyTime: Date.now()
    })
  }
}

const smsSchedule = async () => {
  const smss = await InvoiceManagement.find({
    smsScheduleDate: {
      $gte: moment().toDate(),
      $lt: moment().add(1, 'h').toDate()
    },
    smsScheduleStatus: true
  }).populate(['companyId', 'bankId'])
  const setting = await Setting.findOne()
  for (const sms of smss) {
    const setting = await Setting.findOne()
    const TWILIO_API_KEY =
      setting !== null && setting.twilloApiKey !== ''
        ? setting.twilloApiKey
        : process.env.TWILLO_API_KEY
    const TWILIO_API_SECRET_KEY =
      setting !== null && setting.twilloApiSecretKey !== ''
        ? setting.twilloApiSecretKey
        : process.env.TWILLO_API_SECRET_KEY
    const TWILIO_PHONE =
      setting !== null && setting.twilloPhone !== ''
        ? setting.twilloPhone
        : process.env.TWILLO_PHONE
    const twilio = require('twilio')(TWILIO_API_KEY, TWILIO_API_SECRET_KEY)
    let content = ''
    content += `Dear ${sms?.clientName}\r\n\r\n`
    content += `Kindly find attached the invoice, Please make the payment using the following link.\r\n\r\n`
    content += `${req.protocol}://${
      req.headers.host
    }/invoice-payment?id=${sms?._id.toString()}\r\n\r\n`
    content += `Invoice No: #${sms?.invoiceNumber}\r\n`
    content += `Invoice Date: ${moment(sms?.issuedDate).format(
      'DD/MM/YYYY'
    )}\r\n`
    content += `Description:\r\n`
    for (let description of sms?.description) {
      content += `  ${description.content} - £${description.unitPrice}\r\n`
    }
    content += `Due Date: ${moment(sms?.dueDate).format('DD/MM/YYYY')}\r\n`
    content += `Amount Due: £${sms?.totalAmount}\r\n\r\n`
    content += `Kindly note that if you are doing bank transfer then please ensure that you include the invoice number.\r\n\r\n`
    if (sms?.bankId?._id) {
      content += `Bank account details:\r\n`
      content += `  Beneficiary Name: ${sms?.bankId?.beneficiary}\r\n`
      content += `  Account No: ${sms?.bankId?.accountNo}\r\n`
      content += `  Sort Code: ${sms?.bankId?.sortCode}\r\n\r\n`
    }
    content += `Best regards\r\n`
    content += `${sms?.companyId?.companyName}\r\n\r\n`
    content += `${req.protocol}://${req.headers.host}/upload/pdfs/${sms?.pdf}`

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
