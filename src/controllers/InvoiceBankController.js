const InvoiceBank = require('../models/InvoiceBank')

const getAll = async (req, res) => {
  try {
    let allBank = await InvoiceBank.find({status: true})
    if (allBank) {
      res.json({
        success: true,
        data: allBank
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const createBank = async (req, res) => {
  let bankData = req.body
  try {
    let bank = await InvoiceBank.findOne({ accountNo: bankData.accountNo })
    if (bank) {
      res.json({
        success: false,
        msg: 'The Account already exists.'
      })
    } else {
      let addBank = await InvoiceBank.create(bankData)
      res.json({
        success: true,
        msg: 'Successfully added'
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const updateBank = async (req, res) => {
let bankData = req.body
const { id } = req.params
  try {
    let bank = await InvoiceBank.findByIdAndUpdate(id, bankData)
    res.json({
      success: true,
      msg: bank
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const deleteBank = async (req, res) => {
const { id } = req.params
  try {
    let bank = await InvoiceBank.findByIdAndUpdate(id, {
      status: false
    })
    res.json({
      success: true,
      msg: bank
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterBank = async (req, res) => {
  const { searchBank } = req.body
  let keyword = new RegExp(searchBank, 'i')
  try {
    let filterBanks = await InvoiceBank.find({
      $or: [
        {
          beneficiary: { $regex: keyword }
        },
        {
          accountNo: { $regex: keyword }
        }
      ],
      status: true
    })
    res.json({
      success: true,
      msg: filterBanks
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const filterById = async (req, res) => {
  const { id } = req.params
  try {
    let filterBank = await InvoiceBank.findById(id)
    console.log(filterBank)
    res.json({
      success: true,
      msg: filterBank
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  createBank,
  updateBank,
  getAll,
  searchFilterBank,
  deleteBank,
  filterById
}
