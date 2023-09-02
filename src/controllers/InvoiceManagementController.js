const InvoiceManagement = require('../models/InvoiceManagement')
const Setting = require('../models/Setting')
const sgMail = require('@sendgrid/mail')
var htmlToPdf = require('html-pdf-node')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const qrcode = require('qrcode')
const handlebars = require('handlebars')

handlebars.registerHelper('multiply', function (a, b) {
  return a * b
})

const getAll = async (req, res) => {
  try {
    let allInvoice = await InvoiceManagement.find()
    if (allInvoice) {
      res.json({
        success: true,
        data: allInvoice
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const getAllPending = async (req, res) => {
  try {
    const currentDate = new Date()
    let allInvoice = await InvoiceManagement.find({
      status: 'Pending',
      dueDate: {
        $gt: currentDate
      }
    }).populate([
      'companyId',
      'bankId'
    ])
    if (allInvoice) {
      res.json({
        success: true,
        data: allInvoice
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const getAllPaid = async (req, res) => {
  try {
    let allInvoice = await InvoiceManagement.find({
      $or: [
        {
          status: 'Paid'
        },
        {
          status: 'Partial Paid'
        }
      ]
    }).populate([
      'companyId',
      'bankId'
    ])
    if (allInvoice) {
      res.json({
        success: true,
        data: allInvoice
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const getAllOverdue = async (req, res) => {
  try {
    const currentDate = new Date()
    let allInvoice = await InvoiceManagement.find({
      status: 'Pending',
      dueDate: {
        $lt: currentDate
      }
    }).populate([
      'companyId',
      'bankId'
    ])
    if (allInvoice) {
      res.json({
        success: true,
        data: allInvoice
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const createInvoice = async (req, res) => {
  try {
    let invoiceData = req.body
    let invoice = await InvoiceManagement.findOne({
      invoiceNumber: invoiceData.invoiceNumber
    })
    if (invoice) {
      res.json({
        success: false,
        msg: 'The invoice already exists.'
      })
    } else {
      const pdfFileName = `invoice_${Date.now()}.pdf`
      invoiceData['pdf'] = pdfFileName
      let addInvoice = await InvoiceManagement.create(invoiceData)
      addInvoice = await InvoiceManagement.findById(addInvoice._id).populate([
        'companyId',
        'bankId'
      ])
      const invoicePdfTemplate = fs.readFileSync(
        path.join(__dirname, './generalInvoicePdf.ejs'),
        'utf-8'
      )
      const invoiceParams = {
        logoUrl: `${req.protocol}://${req.headers.host}/upload/invoices/${addInvoice.companyId.companyLogo}`,
        companyName: addInvoice.companyId?.companyName,
        companyAddress: addInvoice.companyId?.companyAddr,
        companyPhone: addInvoice.companyId?.companyPhone,
        companyEmail: addInvoice.companyId?.companyEmail,
        invoiceNo: addInvoice.invoiceNumber,
        issuedDate: moment(addInvoice.issuedDate).format('DD/MM/YYYY'),
        dueDate: moment(addInvoice.dueDate).format('DD/MM/YYYY'),
        clientName: addInvoice.clientName,
        clientAddress: addInvoice.clientAddress,
        clientPhone: addInvoice.clientPhone,
        clientEmail: addInvoice.clientEmail,
        totalAmount: Number(addInvoice.totalAmount).toFixed(2),
        onlinePayLink: `${req.protocol}://${req.headers.host}/invoice-payment?id=${addInvoice._id}`,
        descriptions: addInvoice.description,
        note: addInvoice.companyNote,
        bankAccountName: addInvoice.bankId?.beneficiary,
        bankAccountNo: addInvoice.bankId?.accountNo,
        bankAccountSortCode: addInvoice.bankId?.sortCode
      }
      const compiledInvoicePdfTemplate = handlebars.compile(invoicePdfTemplate)
      const invoicePdfHtml = compiledInvoicePdfTemplate(invoiceParams)
      const output = await htmlToPdf.generatePdf(
        {
          content: invoicePdfHtml
        },
        { format: 'A4' }
      )
      fs.writeFileSync(`upload/pdfs/${pdfFileName}`, output)
      res.json({
        success: true,
        msg: invoice
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterInvoice = async (req, res) => {
  const { searchInvoice } = req.body
  let keyword = new RegExp(searchInvoice, 'i')
  try {
    let filterInvoices = await InvoiceManagement.find({
      $or: [
        {
          clientName: { $regex: keyword }
        }
      ]
    })
    res.json({
      success: true,
      msg: filterInvoices
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterPending = async (req, res) => {
  const { searchInvoice } = req.body
  let keyword = new RegExp(searchInvoice, 'i')
  try {
    const currentDate = new Date()
    let filterInvoices = await InvoiceManagement.find({
      $or: [
        {
          clientName: { $regex: keyword }
        }
      ],
      status: 'Pending',
      dueDate: {
        $gt: currentDate
      }
    })
    res.json({
      success: true,
      msg: filterInvoices
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterPaid = async (req, res) => {
  const { searchInvoice } = req.body
  let keyword = new RegExp(searchInvoice, 'i')
  try {
    let filterInvoices = await InvoiceManagement.find({
      clientName: { $regex: keyword },
      $or: [
        {
          status: 'Paid'
        },
        {
          status: 'Partial Paid'
        }
      ]
    })
    res.json({
      success: true,
      msg: filterInvoices
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterOverdue = async (req, res) => {
  const { searchInvoice } = req.body
  let keyword = new RegExp(searchInvoice, 'i')
  try {
    const currentDate = new Date()
    let filterInvoices = await InvoiceManagement.find({
      dueDate: {
        $lt: currentDate
      },
      clientName: { $regex: keyword },
      $or: [
        {
          status: 'Pending'
        },
        {
          status: 'Partial Paid'
        }
      ]
    })
    res.json({
      success: true,
      msg: filterInvoices
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const filterById = async (req, res) => {
  const { id } = req.params
  try {
    let filterInvoice = await InvoiceManagement.findById(id).populate([
      'companyId',
      'bankId'
    ])
    res.json({
      success: true,
      msg: filterInvoice
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params
    let invoice = await InvoiceManagement.deleteOne({ _id: id })
    res.json({
      success: true,
      msg: invoice
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const updateInvoice = async (req, res) => {
  try {
    let invoiceData = req.body
    const { id } = req.params
    const pdfFileName = `invoice_${Date.now()}.pdf`
    invoiceData.pdf = pdfFileName
    let invoice = await InvoiceManagement.findByIdAndUpdate(id, invoiceData)
    let addInvoice = await InvoiceManagement.findById(id).populate([
      'companyId',
      'bankId'
    ])
    const invoicePdfTemplate = fs.readFileSync(
      path.join(__dirname, './generalInvoicePdf.ejs'),
      'utf-8'
    )
    const invoiceParams = {
      logoUrl: `${req.protocol}://${req.headers.host}/upload/invoices/${addInvoice.companyId.companyLogo}`,
      companyName: addInvoice.companyId?.companyName,
      companyAddress: addInvoice.companyId?.companyAddr,
      companyPhone: addInvoice.companyId?.companyPhone,
      companyEmail: addInvoice.companyId?.companyEmail,
      invoiceNo: addInvoice.invoiceNumber,
      issuedDate: moment(addInvoice.issuedDate).format('DD/MM/YYYY'),
      dueDate: moment(addInvoice.dueDate).format('DD/MM/YYYY'),
      clientName: addInvoice.clientName,
      clientAddress: addInvoice.clientAddress,
      clientPhone: addInvoice.clientPhone,
      clientEmail: addInvoice.clientEmail,
      totalAmount: Number(addInvoice.totalAmount).toFixed(2),
      onlinePayLink: `${req.protocol}://${req.headers.host}/invoice-payment?id=${addInvoice._id}`,
      descriptions: addInvoice.description,
      note: addInvoice.companyNote,
      bankAccountName: addInvoice.bankId?.beneficiary,
      bankAccountNo: addInvoice.bankId?.accountNo,
      bankAccountSortCode: addInvoice.bankId?.sortCode
    }
    const compiledInvoicePdfTemplate = handlebars.compile(invoicePdfTemplate)
    const invoicePdfHtml = compiledInvoicePdfTemplate(invoiceParams)
    const output = await htmlToPdf.generatePdf(
      {
        content: invoicePdfHtml
      },
      { format: 'A4' }
    )
    fs.writeFileSync(`upload/pdfs/${pdfFileName}`, output)
    res.json({
      success: true,
      msg: invoice
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const { invoiceStatus, invoicePaidDate, partialPayValue } = req.body
    let addInvoice = await InvoiceManagement.findById(id).populate([
      'companyId',
      'bankId'
    ])
    const pdfFileName = `invoice_${Date.now()}.pdf`
    const qrcodeFileName = `qrcode_${Date.now()}.png`
    await qrcode.toFile(
      `upload/qrcodes/${qrcodeFileName}`,
      JSON.stringify({
        invoiceNo: addInvoice?.invoiceNumber,
        companyName: addInvoice?.companyId?.companyName,
        clientName: addInvoice?.clientName,
        issuedDate: moment(addInvoice.issuedDate).format('DD/MM/YYYY'),
        totalAmount: Number(addInvoice?.totalAmount).toFixed(2),
        paidAmount: (Number(addInvoice?.paidAmount) + Number(partialPayValue)).toFixed(2),
        paidDate: moment().format('DD/MM/YYYY'),
        linkToPdf: `${req.protocol}://${req.headers.host}/upload/pdfs/${pdfFileName}`
      }).toString()
    )
    let markUpdate = await InvoiceManagement.findByIdAndUpdate(id, {
      status: invoiceStatus,
      paidDate: invoicePaidDate,
      paidAmount: invoiceStatus === 'Paid' ? addInvoice?.totalAmount : invoiceStatus === 'Pending' ? 0 : Number(addInvoice?.paidAmount) + Number(partialPayValue),
      pdf: pdfFileName,
      qrcode: qrcodeFileName
    })
    addInvoice = await InvoiceManagement.findById(id).populate([
      'companyId',
      'bankId'
    ])
    const invoicePdfTemplate = fs.readFileSync(
      path.join(__dirname, './generalInvoicePdf.ejs'),
      'utf-8'
    )
    const invoiceParams = {
      logoUrl: `${req.protocol}://${req.headers.host}/upload/invoices/${addInvoice?.companyId?.companyLogo}`,
      companyName: addInvoice?.companyId?.companyName,
      companyAddress: addInvoice?.companyId?.companyAddr,
      companyPhone: addInvoice?.companyId?.companyPhone,
      companyEmail: addInvoice?.companyId?.companyEmail,
      invoiceNo: addInvoice?.invoiceNumber,
      issuedDate: moment(addInvoice?.issuedDate).format('DD/MM/YYYY'),
      dueDate: moment(addInvoice?.dueDate).format('DD/MM/YYYY'),
      clientName: addInvoice?.clientName,
      clientAddress: addInvoice?.clientAddr,
      clientPhone: addInvoice?.clientPhone,
      clientEmail: addInvoice?.clientEmail,
      totalAmount: Number(addInvoice?.totalAmount).toFixed(2),
      onlinePayLink: `${req.protocol}://${req.headers.host}/invoice-payment?id=${addInvoice?._id.toString()}`,
      descriptions: addInvoice?.description,
      note: addInvoice?.note,
      bankAccountName: addInvoice?.bankId?.beneficiary,
      bankAccountNo: addInvoice?.bankId?.accountNo,
      bankAccountSortCode: addInvoice?.bankId?.sortCode,
      isPaid: addInvoice?.status !== 'Pending' ? 1 : 0,
      isPartial: addInvoice?.status == 'Partial Paid' ? true : false,
      paidAmount: Number(addInvoice?.paidAmount).toFixed(2),
      remainingAmount: (
        Number(addInvoice?.totalAmount) - Number(addInvoice?.paidAmount)
      ).toFixed(2),
      paidDate: moment(addInvoice?.paidDate).format('DD/MM/YYYY HH:mm'),
      qrcodeUrl: addInvoice?.qrcode
        ? `${req.protocol}://${req.headers.host}/upload/qrcodes/${addInvoice?.qrcode}`
        : '',
      partialPaidIconUrl: `${req.protocol}://${req.headers.host}/upload/images/Partial.png`,
      paidIconUrl: `${req.protocol}://${req.headers.host}/upload/images/Paid.png`
    }
    const compiledInvoicePdfTemplate = handlebars.compile(invoicePdfTemplate)
    const invoicePdfHtml = compiledInvoicePdfTemplate(invoiceParams)

    const output = await htmlToPdf.generatePdf(
      {
        content: invoicePdfHtml
      },
      { format: 'A4' }
    )
    fs.writeFileSync(`upload/pdfs/${pdfFileName}`, output)
    res.json({
      success: true,
      msg: markUpdate
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const sendEmail = async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body
    const invoice = await InvoiceManagement.findById(id).populate([
      'companyId',
      'bankId'
    ])
    const logoUrl = invoice?.companyId
      ? `${req.protocol}://${req.headers.host}/upload/invoices/${invoice?.companyId?.companyLogo}`
      : `${req.protocol}://${req.headers.host}/upload/invoices/invoice.png`
    const setting = await Setting.findOne()
    sgMail.setApiKey(
      setting !== null && setting.sendGridApiKey !== ''
        ? setting.sendGridApiKey
        : process.env.SENDGRID_API_KEY
    )
    let attachments = [
      {
        content: fs
          .readFileSync(`upload/pdfs/${invoice.pdf}`)
          .toString('base64'),
        type: 'application/pdf',
        filename: 'invoice.pdf',
        disposition: 'attachment'
      }
    ]

    const invoiceEmailTemplate = fs.readFileSync(
      path.join(__dirname, './invoiceEmail.ejs'),
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
      paymentLink: `${req.protocol}://${req.headers.host}/invoice-payment/${invoice._id}`
    }

    const compiledInvoiceEmailTemplate =
      handlebars.compile(invoiceEmailTemplate)
    const invoiceEmailHtml = compiledInvoiceEmailTemplate(invoiceParams)

    await sgMail.send({
      to: email,
      from: setting !== null && setting.sendGridUser !== '' ? setting.sendGridUser : process.env.SENDGRID_USER,
      subject: 'Your Invoice is currently pending payment.',
      html: invoiceEmailHtml,
      attachments: attachments
    })

    res.json({
      status: true,
      msg: 'Successfully sent.'
    })
  } catch (err) {
    res.json({
      status: false,
      msg: err.message
    })
  }
}

const sendSMS = async (req, res) => {
  try {
    const { id } = req.params
    const { phone } = req.body
    const invoice = await InvoiceManagement.findById(id).populate([
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

    res.json({
      status: true,
      msg: 'Successfully sent.'
    })
  } catch (err) {
    res.json({
      status: false,
      msg: err.message
    })
  }
}

const createPaymentIntent = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceManagement.findById(id).populate('bankId');
    const amount = (Number(invoice.totalAmount) - Number(invoice.paidAmount)) * 100;
    console.log(amount)
    const currency = invoice.bankId ? invoice.bankId.currency : 'USD' 
    const setting = await Setting.findOne()
    const stripe = require('stripe')(setting.stripeSecretKey ? setting.stripeSecretKey : process.env.STRIPE_SECRET_KEY)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {enabled: true}
    })
    console.log("Intet", paymentIntent.client_secret)
    console.log("payment Intent==========>", paymentIntent);
    res.json({
      status: true,
      invoice: invoice,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    res.json({
      status: false,
      msg: err.message
    })
  }
}

module.exports = {
  createInvoice,
  getAll,
  searchFilterInvoice,
  deleteInvoice,
  markAsRead,
  updateInvoice,
  filterById,
  sendSMS,
  sendEmail,
  searchFilterPending,
  getAllPending,
  getAllPaid,
  getAllOverdue,
  searchFilterPaid,
  searchFilterOverdue,
  createPaymentIntent
}
