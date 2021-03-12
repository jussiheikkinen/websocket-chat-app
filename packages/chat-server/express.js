'use strict'

const session = require('express-session')
const express = require('express')
const http = require('http')
const uuid = require('uuid')
const WebSocket = require('ws')
const cors = require('cors')

const app = express()
const map = new Map()

app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
})

app.use(express.static('public'))
app.use(sessionParser)

app.post('/login', function (req, res) {
  const id = uuid.v4()

  console.log(`Updating session for user ${id}`)
  req.session.userId = id
  res.send({ result: 'OK', message: 'Session updated' })
})

app.delete('/logout', function (request, response) {
  const ws = map.get(request.session.userId)

  console.log('Destroying session')
  request.session.destroy(function () {
    if (ws) ws.close()

    response.send({ result: 'OK', message: 'Session destroyed' })
  })
})

const server = http.createServer(app)
const wss = new WebSocket.Server({ clientTracking: false, noServer: true })

server.on('upgrade', function (request, socket, head) {
  console.log('Parsing session from request...')

  sessionParser(request, {}, () => {
    console.log(request.session)
    if (!request.session.userId) {
      console.log('no user')
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    console.log('Session is parsed!')

    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request)
    })
  })
})

wss.on('connection', function (ws, request) {
  const userId = request.session.userId

  map.set(userId, ws)

  ws.on('message', function (message) {
    console.log(`Received message ${message} from user ${userId}`)

    map.forEach((client, key) => {
      console.log('broadcasting to', key)
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  })

  ws.on('close', function () {
    map.delete(userId)
  })
})

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080')
})
