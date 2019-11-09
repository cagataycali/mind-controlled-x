const WebSocket = require('ws')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

class Cortex {
  constructor (user, socketUrl = 'wss://localhost:6868') {
    this.socket = new WebSocket(socketUrl)
    this.headsetId = user.headsetId
    this.authToken = user.authToken
  }

  createSession (authToken, headsetId) {
    const CREATE_SESSION_ID = 5
    const createSessionRequest = {
      jsonrpc: '2.0',
      id: CREATE_SESSION_ID,
      method: 'createSession',
      params: {
        cortexToken: authToken,
        headset: headsetId,
        status: 'active'
      }
    }
    return new Promise(resolve => {
      this.socket.send(JSON.stringify(createSessionRequest))
      this.socket.on('message', data => {
        try {
          if (JSON.parse(data).id === CREATE_SESSION_ID) {
            const sessionId = JSON.parse(data).result.id
            resolve(sessionId)
          }
        } catch (error) { }
      })
    })
  }

  subRequest (stream, authToken, sessionId) {
    const SUB_REQUEST_ID = 6
    const subRequest = {
      jsonrpc: '2.0',
      method: 'subscribe',
      params: {
        cortexToken: authToken,
        session: sessionId,
        streams: stream
      },
      id: SUB_REQUEST_ID
    }
    this.socket.send(JSON.stringify(subRequest))
  }

  sub (streams, event) {
    this.socket.on('open', async () => {
      this.sessionId = await this.createSession(this.authToken, this.headsetId).then(result => result)
      console.log('Session id: ', this.sessionId)

      this.subRequest(streams, this.authToken, this.sessionId)
      this.socket.on('message', event)
    })
  }
}

module.exports = (user, socketUrl) => new Cortex(user, socketUrl)
