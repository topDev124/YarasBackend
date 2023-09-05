// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const InvoiceManagementSchema = mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceCompany'
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    clientAddr: {
        type: String,
        required: true
    },
    clientPhone: {
        type: String,
        required: true
    },
    smsScheduleStatus: {
        type: Boolean,
        required: false
    },
    smsScheduleDate: {
        type: Date,
        required: false
    },
    clientEmail: {
        type: String,
        required: true,
        match: /.+\@.+\..+/
    },
    emailScheduleStatus: {
        type: Boolean,
        required: false
    },
    emailScheduleDate: {
        type: Date,
        required: false
    },
    description: {
        type: Array,
        required: false
    },
    showQuantity: {
        type: Boolean,
        required: false
    },
    note: {
        type: String,
        required: false
    },
    totalAmount: {
        type: Number,
        required: true
    },
    issuedDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true
    },
    paidDate: {
        type: Date,
        required: false
    },
    paidAmount: {
        type: Number,
        required: false
    },
    bankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceBank'
    },
    bankStatus: {
        type: Boolean,
        required: false
    },
    pdf: {
        type: String,
        required: false
    },
    qrcode: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const InvoiceManagement = mongoose.model('InvoiceManagement', InvoiceManagementSchema);

module.exports = InvoiceManagement;