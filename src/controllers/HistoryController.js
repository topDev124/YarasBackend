const History = require('../models/History')
const InvoiceManagement = require('../models/InvoiceManagement')
const moment = require('moment')

const getAll = async (req, res) => {
  try {
    let allHistory = await History.find()
    res.json({
      status: true,
      msg: allHistory
    })
  } catch (err) {
    res.json({
      status: false,
      msg: err.message
    })
  }
}

const createHistory = async (req, res) => {
  try {
    let { historyTo, historyType, historyTime } = req.body
    await History.create({
      historyTo,
      historyType,
      historyTime: moment(historyTime).format('DD/MM/YYYY hh:mm')
    })
    res.json({
      success: true,
      msg: "Successful add"
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  getAll,
  createHistory
}
