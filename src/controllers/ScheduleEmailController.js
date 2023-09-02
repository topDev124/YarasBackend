const ScheduleEmail = require('../models/ScheduleEmail')

const createSchedule = async (req, res) => {
  try {
    let { scheduleId, sendCount } = req.body
    const filterOne = await ScheduleEmail.findOne({scheduleId: scheduleId})
    console.log(filterOne)
    if(filterOne) {
      const updateSchedule = await ScheduleEmail.findByIdAndUpdate(filterOne._id, {
        sendCount: filterOne.sendCount + 1
      })
    } else {
      const createSchedule = await ScheduleEmail.create({scheduleId: scheduleId, sendCount: sendCount})
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
