// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const SettingSchema = mongoose.Schema({
    stripePrivateKey: {
        type: String,
        required: false
    },
    stripeSecretKey: {
        type: String,
        required: false
    },
    sendGridApiKey: {
        type: String,
        required: false
    },
    sendGridUser: {
        type: String,
        required: false
    },
    twilloApiKey: {
        type: String,
        required: false
    },
    twilloApiSecretKey: {
        type: String,
        required: false
    },
    twilloPhone: {
        type: String,
        required: false
    },
    twilloWhatsappPhone: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

const Setting = mongoose.model('Setting', SettingSchema);

module.exports = Setting;