const WebSocket = require('ws')

// USAGE:
// index.js
// const cortex = require('./cortex-full')({
//   license: 'free',
//   clientId: 'xxxx',
//   clientSecret: 'xxxx',
//   debit: 1,
// })

/**
 * This class handle:
 *  - create websocket connection
 *  - handle request for : headset , request access, control headset ...
 *  - handle 2 main flows : sub and train flow
 *  - use async/await and Promise for request need to be run on sync
 */
class Cortex {
  constructor (user, socketUrl = 'wss://localhost:6868') {
    // create socket
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
    this.socket = new WebSocket(socketUrl)

    // read user infor
    this.user = user
  }

  queryHeadsetId () {
    const QUERY_HEADSET_ID = 2
    const socket = this.socket
    const queryHeadsetRequest = {
      jsonrpc: '2.0',
      id: QUERY_HEADSET_ID,
      method: 'queryHeadsets',
      params: {}
    }

    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(queryHeadsetRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == QUERY_HEADSET_ID) {
            // console.log(data)
            // console.log(JSON.parse(data)['result'].length)
            if (JSON.parse(data).result.length > 0) {
              const headsetId = JSON.parse(data).result[0].id
              resolve(headsetId)
            } else {
              console.log(
                'No have any headset, please connect headset with your pc.'
              )
            }
          }
        } catch (error) { }
      })
    })
  }

  requestAccess () {
    const socket = this.socket
    const user = this.user
    return new Promise(function (resolve, reject) {
      const REQUEST_ACCESS_ID = 1
      const requestAccessRequest = {
        jsonrpc: '2.0',
        method: 'requestAccess',
        params: {
          clientId: user.clientId,
          clientSecret: user.clientSecret
        },
        id: REQUEST_ACCESS_ID
      }

      // console.log('start send request: ',requestAccessRequest)
      socket.send(JSON.stringify(requestAccessRequest))

      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == REQUEST_ACCESS_ID) {
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  authorize () {
    const socket = this.socket
    const user = this.user
    return new Promise(function (resolve, reject) {
      const AUTHORIZE_ID = 4
      const authorizeRequest = {
        jsonrpc: '2.0',
        method: 'authorize',
        params: {
          clientId: user.clientId,
          clientSecret: user.clientSecret,
          // "license": user.license,
          debit: user.debit
        },
        id: AUTHORIZE_ID
      }
      socket.send(JSON.stringify(authorizeRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == AUTHORIZE_ID) {
            const cortexToken = JSON.parse(data).result.cortexToken
            resolve(cortexToken)
          }
        } catch (error) { }
      })
    })
  }

  controlDevice (headsetId) {
    const socket = this.socket
    const CONTROL_DEVICE_ID = 3
    const controlDeviceRequest = {
      jsonrpc: '2.0',
      id: CONTROL_DEVICE_ID,
      method: 'controlDevice',
      params: {
        command: 'connect',
        headset: headsetId
      }
    }
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(controlDeviceRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == CONTROL_DEVICE_ID) {
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  createSession (authToken, headsetId) {
    const socket = this.socket
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
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(createSessionRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == CREATE_SESSION_ID) {
            const sessionId = JSON.parse(data).result.id
            resolve(sessionId)
          }
        } catch (error) { }
      })
    })
  }

  startRecord (authToken, sessionId, recordName) {
    const socket = this.socket
    const CREATE_RECORD_REQUEST_ID = 11

    const createRecordRequest = {
      jsonrpc: '2.0',
      method: 'updateSession',
      params: {
        cortexToken: authToken,
        session: sessionId,
        status: 'startRecord',
        title: recordName,
        description: 'test_marker',
        groupName: 'QA'
      },
      id: CREATE_RECORD_REQUEST_ID
    }

    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(createRecordRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == CREATE_RECORD_REQUEST_ID) {
            console.log(
              'CREATE RECORD RESULT --------------------------------'
            )
            console.log(data)
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  injectMarkerRequest (authToken, sessionId, label, value, port, time) {
    const socket = this.socket
    const INJECT_MARKER_REQUEST_ID = 13
    const injectMarkerRequest = {
      jsonrpc: '2.0',
      id: INJECT_MARKER_REQUEST_ID,
      method: 'injectMarker',
      params: {
        cortexToken: authToken,
        session: sessionId,
        label: label,
        value: value,
        port: port,
        time: time
      }
    }

    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(injectMarkerRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == INJECT_MARKER_REQUEST_ID) {
            console.log(
              'INJECT MARKER RESULT --------------------------------'
            )
            console.log(data)
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  stopRecord (authToken, sessionId, recordName) {
    const socket = this.socket
    const STOP_RECORD_REQUEST_ID = 12
    const stopRecordRequest = {
      jsonrpc: '2.0',
      method: 'updateSession',
      params: {
        cortexToken: authToken,
        session: sessionId,
        status: 'stopRecord',
        title: recordName,
        description: 'test_marker',
        groupName: 'QA'
      },
      id: STOP_RECORD_REQUEST_ID
    }

    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(stopRecordRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == STOP_RECORD_REQUEST_ID) {
            console.log('STOP RECORD RESULT --------------------------------')
            console.log(data)
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  addMarker () {
    this.socket.on('open', async () => {
      await this.checkGrantAccessAndQuerySessionInfo()

      const recordName = 'test_marker'
      await this.startRecord(this.authToken, this.sessionId, recordName)

      const thisInjectMarker = this
      const numberOfMarker = 10
      for (let numMarker = 0; numMarker < numberOfMarker; numMarker++) {
        setTimeout(async function () {
          // injectMarkerRequest(authToken, sessionId, label, value, port, time)
          const markerLabel = 'marker_number_' + numTrain
          const markerTime = Date.now()
          const marker = {
            label: markerLabel,
            value: 'test',
            port: 'test',
            time: markerTime
          }

          await thisInjectMarker.injectMarkerRequest(
            thisInjectMarker.authToken,
            thisInjectMarker.sessionId,
            marker.label,
            marker.value,
            marker.port,
            marker.time
          )
        }, 3000)
      }

      await thisStopRecord.stopRecord(
        thisStopRecord.authToken,
        thisStopRecord.sessionId,
        recordName
      )
    })
  }

  subRequest (stream, authToken, sessionId) {
    const socket = this.socket
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
    socket.send(JSON.stringify(subRequest))
    socket.on('message', data => {
      try {
        // if(JSON.parse(data)['id']==SUB_REQUEST_ID){
        // console.log(data)
        // }
      } catch (error) { }
    })
  }

  mentalCommandActiveActionRequest (authToken, sessionId, profile, action) {
    const socket = this.socket
    const MENTAL_COMMAND_ACTIVE_ACTION_ID = 10
    const mentalCommandActiveActionRequest = {
      jsonrpc: '2.0',
      method: 'mentalCommandActiveAction',
      params: {
        cortexToken: authToken,
        status: 'set',
        session: sessionId,
        profile: profile,
        actions: action
      },
      id: MENTAL_COMMAND_ACTIVE_ACTION_ID
    }
    // console.log(mentalCommandActiveActionRequest)
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(mentalCommandActiveActionRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == MENTAL_COMMAND_ACTIVE_ACTION_ID) {
            console.log(
              'MENTAL COMMAND ACTIVE ACTION RESULT --------------------'
            )
            console.log(data)
            console.log('\r\n')
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  /**
         * - query headset infor
         * - connect to headset with control device request
         * - authentication and get back auth token
         * - create session and get back session id
         */
  async querySessionInfo () {
    let headsetId = ''
    await this.queryHeadsetId().then(headset => {
      headsetId = headset
    })
    this.headsetId = headsetId

    let ctResult = ''
    await this.controlDevice(headsetId).then(result => {
      ctResult = result
    })
    this.ctResult = ctResult
    console.log('CT RESULT', ctResult)

    let authToken = ''
    await this.authorize()
      .then(auth => {
        console.log('auth: 369', auth)
        authToken = auth
      })
      .catch(console.log)
    this.authToken = authToken
    console.log('371, authtoken', authToken)

    let sessionId = ''
    await this.createSession(authToken, headsetId).then(result => {
      sessionId = result
    })
    this.sessionId = sessionId

    console.log('HEADSET ID -----------------------------------')
    console.log(this.headsetId)
    console.log('\r\n')
    console.log('CONNECT STATUS -------------------------------')
    console.log(this.ctResult)
    console.log('\r\n')
    console.log('AUTH TOKEN -----------------------------------')
    console.log(this.authToken)
    console.log('\r\n')
    console.log('SESSION ID -----------------------------------')
    console.log(this.sessionId)
    console.log('\r\n')
  }

  /**
         * - check if user logined
         * - check if app is granted for access
         * - query session info to prepare for sub and train
         */
  async checkGrantAccessAndQuerySessionInfo () {
    let requestAccessResult = ''
    await this.requestAccess().then(result => {
      requestAccessResult = result
    })
    const accessGranted = JSON.parse(requestAccessResult)

    // check if user is logged in CortexUI
    if ('error' in accessGranted) {
      console.log(
        'You must login on CortexUI before request for grant access then rerun'
      )
      throw new Error(
        'You must login on CortexUI before request for grant access'
      )
    } else {
      console.log(accessGranted.result.message)
      // console.log(accessGranted['result'])
      if (accessGranted.result.accessGranted) {
        await this.querySessionInfo()
      } else {
        console.log(
          'You must accept access request from this app on CortexUI then rerun'
        )
        throw new Error(
          'You must accept access request from this app on CortexUI'
        )
      }
    }
  }

  /**
         *
         * - check login and grant access
         * - subcribe for stream
         * - logout data stream to console or file
         */
  sub (streams, event) {
    this.socket.on('open', async () => {
      await this.checkGrantAccessAndQuerySessionInfo()
      this.subRequest(streams, this.authToken, this.sessionId)
      this.socket.on('message', data => {
        // log stream data to file or console here
        event(data)
      })
    })
  }

  setupProfile (authToken, headsetId, profileName, status) {
    const SETUP_PROFILE_ID = 7
    const setupProfileRequest = {
      jsonrpc: '2.0',
      method: 'setupProfile',
      params: {
        cortexToken: authToken,
        headset: headsetId,
        profile: profileName,
        status: status
      },
      id: SETUP_PROFILE_ID
    }
    // console.log(setupProfileRequest)
    const socket = this.socket
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(setupProfileRequest))
      socket.on('message', data => {
        if (status == 'create') {
          resolve(data)
        }

        try {
          // console.log('inside setup profile', data)
          if (JSON.parse(data).id == SETUP_PROFILE_ID) {
            if (JSON.parse(data).result.action == status) {
              console.log(
                'SETUP PROFILE -------------------------------------'
              )
              console.log(data)
              console.log('\r\n')
              resolve(data)
            }
          }
        } catch (error) { }
      })
    })
  }

  queryProfileRequest (authToken) {
    const QUERY_PROFILE_ID = 9
    const queryProfileRequest = {
      jsonrpc: '2.0',
      method: 'queryProfile',
      params: {
        cortexToken: authToken
      },
      id: QUERY_PROFILE_ID
    }

    const socket = this.socket
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(queryProfileRequest))
      socket.on('message', data => {
        try {
          if (JSON.parse(data).id == QUERY_PROFILE_ID) {
            // console.log(data)
            resolve(data)
          }
        } catch (error) { }
      })
    })
  }

  /**
         *  - handle send training request
         *  - handle resolve for two difference status : start and accept
         */
  trainRequest (authToken, sessionId, action, status) {
    const TRAINING_ID = 8
    const SUB_REQUEST_ID = 6
    const trainingRequest = {
      jsonrpc: '2.0',
      method: 'training',
      params: {
        cortexToken: authToken,
        detection: 'mentalCommand',
        session: sessionId,
        action: action,
        status: status
      },
      id: TRAINING_ID
    }

    // console.log(trainingRequest)
    // each train take 8 seconds for complete
    console.log('YOU HAVE 8 SECONDS FOR THIS TRAIN')
    console.log('\r\n')

    const socket = this.socket
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(trainingRequest))
      socket.on('message', data => {
        // console.log('inside training ', data)
        try {
          if (JSON.parse(data)[id] == TRAINING_ID) {
            console.log(data)
          }
        } catch (error) { }

        // incase status is start training, only resolve until see "MC_Succeeded"
        if (status == 'start') {
          try {
            if (JSON.parse(data).sys[1] == 'MC_Succeeded') {
              console.log(
                'START TRAINING RESULT --------------------------------------'
              )
              console.log(data)
              console.log('\r\n')
              resolve(data)
            }
          } catch (error) { }
        }

        // incase status is accept training, only resolve until see "MC_Completed"
        if (status == 'accept') {
          try {
            if (JSON.parse(data).sys[1] == 'MC_Completed') {
              console.log(
                'ACCEPT TRAINING RESULT --------------------------------------'
              )
              console.log(data)
              console.log('\r\n')
              resolve(data)
            }
          } catch (error) { }
        }
      })
    })
  }

  /**
         * - check login and grant access
         * - create profile if not yet exist
         * - load profile
         * - sub stream 'sys' for training
         * - train for actions, each action in number of time
         *
         */
  train (profileName, trainingActions, numberOfTrain) {
    this.socket.on('open', async () => {
      console.log('start training flow')

      // check login and grant access
      await this.checkGrantAccessAndQuerySessionInfo()

      // to training need subcribe 'sys' stream
      this.subRequest(['sys'], this.authToken, this.sessionId)

      // create profile
      let status = 'create'
      let createProfileResult = ''
      await this.setupProfile(
        this.authToken,
        this.headsetId,
        profileName,
        status
      ).then(result => {
        createProfileResult = result
      })

      // load profile
      status = 'load'
      let loadProfileResult = ''
      await this.setupProfile(
        this.authToken,
        this.headsetId,
        profileName,
        status
      ).then(result => {
        loadProfileResult = result
      })

      // training all actions
      const self = this

      for (const trainingAction of trainingActions) {
        for (let numTrain = 0; numTrain < numberOfTrain; numTrain++) {
          // start training for 'neutral' action
          console.log(
            `START TRAINING "${trainingAction}" TIME ${numTrain +
            1} ---------------`
          )
          console.log('\r\n')
          await self.trainRequest(
            self.authToken,
            self.sessionId,
            trainingAction,
            'start'
          )

          //
          // FROM HERE USER HAVE 8 SECONDS TO TRAIN SPECIFIC ACTION
          //

          // accept 'neutral' result
          console.log(
            `ACCEPT "${trainingAction}" TIME ${numTrain +
            1} --------------------`
          )
          console.log('\r\n')
          await self.trainRequest(
            self.authToken,
            self.sessionId,
            trainingAction,
            'accept'
          )
        }

        const status = 'save'
        let saveProfileResult = ''

        // save profile after train
        await self
          .setupProfile(self.authToken, self.headsetId, profileName, status)
          .then(result => {
            saveProfileResult = result
            console.log(`COMPLETED SAVE ${trainingAction} FOR ${profileName}`)
          })
      }
    })
  }

  /**
         *
         * - load profile which trained before
         * - sub 'com' stream (mental command)
         * - user think specific thing which used while training, for example 'push' action
         * - 'push' command should show up on mental command stream
         */
  live (profileName) {
    this.socket.on('open', async () => {
      await this.checkGrantAccessAndQuerySessionInfo()

      // load profile
      let loadProfileResult = ''
      const status = 'load'
      await this.setupProfile(
        this.authToken,
        this.headsetId,
        profileName,
        status
      ).then(result => {
        loadProfileResult = result
      })
      console.log(loadProfileResult)

      // // sub 'com' stream and view live mode
      this.subRequest(['com'], this.authToken, this.sessionId)

      this.socket.on('message', data => {
        console.log(data)
      })
    })
  }
}

module.exports = (user, socketUrl) => new Cortex(user, socketUrl)
