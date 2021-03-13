'use strict'

const session = require('express-session')
const express = require('express')
const http = require('http')
const uuid = require('uuid')
const WebSocket = require('ws')
const cors = require('cors')
const Chance = require('chance')

const chance = new Chance()

const app = express()
const connections = new Map()
const sessionCache = new Map()

app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://192.168.1.104:3000']
}))

const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
})

app.use(express.static('public'))
app.use(sessionParser)

app.post('/login', function (req, res) {
  const id = uuid.v4()
  const animal = chance.animal()

  console.log(`Updating session for user ${id}`)

  req.session.userId = id
  sessionCache.set(id, animal)
  res.send({ result: 'OK', message: 'Session updated', username: animal})
})

app.delete('/logout', function (request, response) {
  const ws = connections.get(request.session.userId)

  console.log('Destroying session')
  request.session.destroy(function () {
    if (ws) ws.client.close()

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

  connections.set(userId, {client: ws, username: sessionCache.get(userId)})

  ws.on('message', function (message) {
    console.log(`Received message ${message} from user ${userId}`)
    const user = connections.get(userId)

    connections.forEach(({ client }, key) => {
      console.log('broadcasting to', key)
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          user: key,
          username: user.username,
          message: message,
          timestamp: +new Date(),
          sentByMe: key === userId
        }))
      }
    })
  })

  ws.on('close', function () {
    console.log('Closing connection')
    connections.delete(userId)
  })
})

server.listen(8080, function () {
  console.log('Listening on http://localhost:8080')
})
