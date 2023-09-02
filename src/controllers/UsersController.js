const jwt = require('jsonwebtoken')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
var md5 = require('md5')

const login = async (req, res) => {
  try {
    let { userEmail, userPassword } = req.body
    let user = await User.findOne({ userEmail: userEmail })
    const password = md5(userPassword)
    if (user && password === user.userPassword) {
      token = jwt.sign(
        { userId: user._id, email: user.userEmail },
        process.env.TOKEN_KEY,
        { expiresIn: '1d' }
      )
      res.json({
        success: true,
        data: {
          token,
          userId: user._id,
          email: user.userEmail,
          name: user.userName
        },
        msg: 'Login Successful'
      })
    } 
    if (user && user.userPassword !== password) {
      res.json({
        success: false,
        msg: 'Password incorrect.'
      })
    }
    if (!user) {
      res.json({
        success: false,
        msg: 'No account yet. Register now.'
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

const changePass = async (req, res) => {
  try {
    const { currentPassword, changePassword } = req.body
    let user = await User.findOne();
    if (md5(currentPassword) === user.userPassword) {
      await User.findByIdAndUpdate('64e575d847baeb6fc8259b5b',{userPassword: md5(changePassword)})
      res.json({
        success: true,
        msg: 'Change Successfully'
      })
    } else {
      res.json({
        success: false,
        msg: 'CurrentPassword is incorrect.'
      })
    }
  } catch (err) {
    res.json({
      success: false,
      msg: err.message
    })
  }
}

module.exports = {
  login,
  changePass
}
