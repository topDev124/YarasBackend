const InvoiceCompany = require('../models/InvoiceCompany')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const getAll = async (req, res) => {
  try {
    let allCompany = await InvoiceCompany.find({status: true})
    if (allCompany) {
      res.json({
        success: true,
        data: allCompany
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const createCompany = async (req, res) => {
  try {
    let companyData = req.body
    companyData['companyLogo'] = req.file.filename
    let company = await InvoiceCompany.findOne({
      companyName: companyData.companyName
    })
    if (company) {
      res.json({
        success: false,
        msg: 'The company already exists.'
      })
    } else {
      let addCompany = await InvoiceCompany.create(companyData)
      res.json({
        success: true,
        msg: companyData
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const updateCompany = async (req, res) => {
  try {
    let companyData = req.body
    if (req.file) {
      companyData['companyLogo'] = req.file.filename
    }
    const { id } = req.params
    let company = await InvoiceCompany.findByIdAndUpdate(id, companyData)
    res.json({
      success: true,
      msg: company
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params
    let company = await InvoiceCompany.findByIdAndUpdate(id, {
      status: false
    })
    res.json({
      success: true,
      msg: company
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const filterbyName = async (req, res) => {
  const { companyN } = req.body
  try {
    let filter = await InvoiceCompany.findOne({ companyName: companyN })
    console.log(filter)
    res.json({
      success: true,
      msg: filter
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const searchFilterCompany = async (req, res) => {
  const { searchCompany } = req.body
  let keyword = new RegExp(searchCompany, 'i')
  console.log(searchCompany)
  try {
    let filterCompanies = await InvoiceCompany.find({
      $or: [
        {
          companyName: { $regex: keyword }
        },
        {
          companyEmail: { $regex: keyword }
        },
        {
          companyPhone: { $regex: keyword }
        }
      ],
      status: true
    })
    res.json({
      success: true,
      msg: filterCompanies
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
    let filterCompany = await InvoiceCompany.findById(id)
    res.json({
      success: true,
      msg: filterCompany
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  createCompany,
  getAll,
  searchFilterCompany,
  updateCompany,
  filterbyName,
  deleteCompany,
  filterById
}
