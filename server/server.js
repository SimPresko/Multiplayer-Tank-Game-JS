const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const { SourceTextModule } = require('vm')
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static(path.join(__dirname, '../', '/client/public')))

const clientLandingPage = path.join(__dirname, '../', '/client/index.html')
app.get('/', (req, res) => {
  res.sendFile(clientLandingPage)
})

server.listen(2000, () => {
  console.log('Server is running on port 2000...')
})

let players = {}
let keyStates = {}

const SPEED = 10
const TICK_SPEED = 1000 / 30

io.on('connection', (socket) => {
  console.log('A user connected')
  players[socket.id] = {
    x: Math.floor(Math.random() * 30) * 20 + 100,
    y: Math.floor(Math.random() * 20) * 20 + 100,
  }
  console.log(players[socket.id])

  socket.on('keyState', (keys) => {
    keyStates[socket.id] = keys
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
    delete players[socket.id]
  })
})

setInterval(function () {
  for (let id in players) {
    if (!keyStates[id]) continue

    let player = players[id]
    let keys = keyStates[id]

    let moveX =
      (keys['ArrowRight'] || keys['d'] ? 1 : 0) -
      (keys['ArrowLeft'] || keys['a'] ? 1 : 0)
    let moveY =
      (keys['ArrowDown'] || keys['s'] ? 1 : 0) -
      (keys['ArrowUp'] || keys['w'] ? 1 : 0)

    if (moveX !== 0 && moveY !== 0) {
      moveX *= Math.SQRT1_2
      moveY *= Math.SQRT1_2
    }

    player.x = Math.max(0, Math.min(880, player.x + moveX * SPEED))
    player.y = Math.max(0, Math.min(580, player.y + moveY * SPEED))
  }
  io.emit('state', players)
}, TICK_SPEED)
