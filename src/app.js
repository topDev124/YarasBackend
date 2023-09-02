const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cron = require('node-cron');

require('dotenv').config()

const api = require('./api/UserApi')
const { connect } = require('./services/database')
const { emailSchedule, smsSchedule } = require('./services/schedule')

const app = express()

// cron.schedule('* * * */7 * *', () => {
//     console.log('================ Sending Email every 7 days ================');
//     emailSchedule();
// });

// cron.schedule('* * * */7 * *', () => {
//     console.log('============= Sending Sms every 7 days =================');
//     smsSchedule();
// })

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use("/upload", express.static("upload"));
connect('mongodb://0.0.0.0:27017')
app.use('/api', api);

module.exports = app
