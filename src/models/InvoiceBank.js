// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const InvoiceBankSchema = mongoose.Schema({
    beneficiary: {
        type: String,
        required: true
    },
    accountNo: {
        type: String,
        required: true
    },
    sortCode: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

const InvoiceBank = mongoose.model('InvoiceBank', InvoiceBankSchema);

module.exports = InvoiceBank;