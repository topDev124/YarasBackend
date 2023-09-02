const ScheduleSms = require('../models/ScheduleSms')

const createSchedule = async (req, res) => {
  try {
    let { scheduleId, sendCount } = req.body
    const filterOne = await ScheduleSms.findOne({scheduleId: scheduleId})
    if(filterOne) {
      const updateSchedule = await ScheduleSms.findByIdAndUpdate(filterOne._id, {
        sendCount: filterOne.sendCount + 1
      })
    } else {
      const createSchedule = await ScheduleSms.create({scheduleId: scheduleId, sendCount: sendCount})
    }
    res.json({
      success: true,
      msg: 'Successfully added'
    })
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  createSchedule
}
