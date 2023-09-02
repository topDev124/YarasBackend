// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const ScheduleSmsSchema = mongoose.Schema({
    scheduleId: {
        type: String,
        required: true
    },
    sendCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const ScheduleSms = mongoose.model('ScheduleSms', ScheduleSmsSchema);

module.exports = ScheduleSms;