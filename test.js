const mind = require('./index')({
  headsetId: 'EPOCPLUS-xxxxxxxx',
  authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
})
const streams = ['com', 'mot', 'fac'] // https://emotiv.github.io/cortex-docs/#subscriptions

mind.sub(streams, async event => {
  const data = JSON.parse(event)
  console.log(data)
})
