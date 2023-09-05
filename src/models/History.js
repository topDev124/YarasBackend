// Require Mongoose
const mongoose = require('mongoose')
// Define a schema
const Schema = mongoose.Schema

const historySchema = mongoose.Schema({
    historyTo: {
      type: String,
      required: false
    },
    historyType: {
      type: String,
      required: false
    },
    historyTime: {
      type: Date,
      required: false
    }
  },{
    timestamps: true
  }
)

const History = mongoose.model('History', historySchema)

module.exports = History
