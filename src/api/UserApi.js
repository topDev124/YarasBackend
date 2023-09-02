const express = require('express')
const path = require('path')
const router = express.Router()
const { checkAuth } = require('../middlewares')
const UserCtrl = require('../controllers/UsersController')
const InvoiceCompany = require('../controllers/InvoiceCompanyController')
const InvoiceBank = require('../controllers/InvoiceBankController')
const InvoiceManagement = require('../controllers/InvoiceManagementController')
const Setting = require('../controllers/SettingController')
const ScheduledEmail = require('../controllers/ScheduleEmailController')
const ScheduledSms = require('../controllers/ScheduleSmsController')

const multer = require('multer')
const companyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/invoices')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const companyUpload = multer({ storage: companyStorage })

router.post('/user/login', UserCtrl.login)
router.post('/user/change-password', UserCtrl.changePass)

router.post('/setting/save', Setting.saveInfo)
router.post('/setting/get', Setting.getInfo)

router.post(
  '/invoice/createCompany',
  companyUpload.single('companyLogo'),
  InvoiceCompany.createCompany
)
router.post(
  '/invoice/updateCompany/:id',
  companyUpload.single('companyLogo'),
  InvoiceCompany.updateCompany
)
router.post('/invoice/getAllCompany', checkAuth, InvoiceCompany.getAll)
router.post('/invoice/searchCompany', InvoiceCompany.searchFilterCompany)
router.post('/invoice/filterbyName', InvoiceCompany.filterbyName)
router.post('/invoice/deleteCompany/:id', InvoiceCompany.deleteCompany)
router.post('/invoice/filterCompanyById/:id', InvoiceCompany.filterById)

router.post('/invoice/createBank', InvoiceBank.createBank)
router.post('/invoice/updateBank/:id', InvoiceBank.updateBank)
router.post('/invoice/getAllBank', InvoiceBank.getAll)
router.post('/invoice/searchBank', InvoiceBank.searchFilterBank)
router.post('/invoice/deleteBank/:id', InvoiceBank.deleteBank)
router.post('/invoice/filterBankById/:id', InvoiceBank.filterById)

router.post('/invoice/getAll', InvoiceManagement.getAll)
router.post('/invoice/getPending', InvoiceManagement.getAllPending)
router.post('/invoice/getPaid', InvoiceManagement.getAllPaid)
router.post('/invoice/getOverdue', InvoiceManagement.getAllOverdue)
router.post('/invoice/createInvoice', InvoiceManagement.createInvoice)
router.post('/invoice/searchAll', InvoiceManagement.searchFilterInvoice)
router.post('/invoice/searchPending', InvoiceManagement.searchFilterPending)
router.post('/invoice/searchOverdue', InvoiceManagement.searchFilterOverdue)
router.post('/invoice/searchPaid', InvoiceManagement.searchFilterPaid)
router.post('/invoice/deleteInvoice/:id', InvoiceManagement.deleteInvoice)
router.post('/invoice/markAsRead/:id', InvoiceManagement.markAsRead)
router.post('/invoice/updateInvoice/:id', InvoiceManagement.updateInvoice)
router.post('/invoice/filterInvoiceById/:id', InvoiceManagement.filterById)
router.get('/invoice/create-payment-intent/:id', InvoiceManagement.createPaymentIntent)

router.post('/invoice/:id/send-sms', InvoiceManagement.sendSMS)
router.post('/invoice/:id/send-email', InvoiceManagement.sendEmail)

router.post('/invoice/schedule/add-email', ScheduledEmail.createSchedule)
router.post('/invoice/schedule/add-sms', ScheduledSms.createSchedule)
module.exports = router
