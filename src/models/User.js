// Require Mongoose
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
// Define a schema
const Schema = mongoose.Schema;

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
    },
    userPassword: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;