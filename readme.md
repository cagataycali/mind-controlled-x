Mind Controlled X
-----------

Your new mind controlled X projects start point.

Installation
-----------

```bash
git clone mind-controlled-x
cd mind-controlled-x
npm install
```

Usage
-----------

`index.js`

```javascript
// First usage. (Needs internet connection.)
const mind = require('./index')({
  license: 'free',
  clientId: 'xxxxxxxxxxxx',
  clientSecret: 'xxxxxxxxx',
  debit: 1,
}) // Copy auth token and headset ID and use below (Does not needs internet connection.)
// --------------- OR ---------------
const mind = require('./index')({
  headsetId: 'EPOCPLUS-xxxxxxxx',
  authToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
})

const streams = ['com', 'mot', 'fac'] // https://emotiv.github.io/cortex-docs/#subscriptions

mind.sub(streams, async event => {
  const data = JSON.parse(event)
  console.log(data)
})
```