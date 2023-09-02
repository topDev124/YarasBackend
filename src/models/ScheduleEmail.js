// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const ScheduleEmailSchema = mongoose.Schema({
    scheduleId: {
        type: String,
        required: true,
        unique: true
    },
    sendCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const ScheduleEmail = mongoose.model('ScheduleEmail', ScheduleEmailSchema);

module.exports = ScheduleEmail;