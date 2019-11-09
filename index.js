module.exports = user => {
  if (user.headsetId && user.authToken) {
    const cortex = require('./cortex')(user)
    return cortex
  } else {
    const cortex = require('./cortex-full')(user)
    return cortex
  }
}
