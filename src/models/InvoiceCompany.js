// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const InvoiceCompanySchema = mongoose.Schema({
    companyLogo: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true,
    },
    companyAddr: {
        type: String,
        required: true
    },
    companyEmail: {
        type: String,
        required: true,
        match: /.+\@.+\..+/
    },
    companyPhone: {
        type: String,
        required: true
    },
    vatSwitch: {
        type: Boolean,
        required: true
    },
    vatValue: {
        type: Number,
        required: false
    },
    status: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

const InvoiceCompany = mongoose.model('InvoiceCompany', InvoiceCompanySchema);

module.exports = InvoiceCompany;