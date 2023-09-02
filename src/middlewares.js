const jwt = require("jsonwebtoken");

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

const checkAuth = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];
  if (!token) {
    return res.status(419).json({
      status: false
    });
  } else {
    jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
      if (err || !user) {
        return res.status(419).json({
          status: false
        })
      }
      req.user = user;
      next();
    })    
  }
}

module.exports = {
  notFound,
  errorHandler,
  checkAuth,
};
