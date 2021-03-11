const fs = require('fs')
const http = require('http')
const WebSocket = require('ws')

// const server = https.createServer({
//   cert: fs.readFileSync('/path/to/cert.pem'),
//   key: fs.readFileSync('/path/to/key.pem')
// })

const server = http.createServer()
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection(ws, request, client) {
  ws.on('message', function incoming(message) {
    console.log(`Received message ${message} from user ${client}`)
  })

  ws.send('something')
})

server.listen(8080)
