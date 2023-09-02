const Setting = require('../models/Setting')

const saveInfo = async (req, res) => {
  try {
    let settingData = req.body
    let settingAll = await Setting.find()
    console.log(settingAll)
    if (settingAll.length > 0) {
      console.log("Update", settingAll[0]._id)
      let updateInfo = await Setting.findByIdAndUpdate(settingAll[0]._id, settingData)
      res.json({
        success: true,
        msg: 'updated Setting'
      })
    } else {
      console.log("Create")
      let createInfo = await Setting.create(settingData)
      res.json({
        success: true,
        msg: 'created Setting'
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const getInfo = async (req, res) => {
  try {
    let settingAll = await Setting.find()
    res.json({
      success: true,
      msg: settingAll
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  saveInfo,
  getInfo
}
