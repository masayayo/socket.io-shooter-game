const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)

app.use(express.static(__dirname + "/../Client"))
app.get("/", (req, res) =>
  res.sendFile("index.html", { root: __dirname + "/../Client" })
)
const players = {}

io.on("connection", socket => {
  socket.on("disconnect", () => {
    io.emit("playerDisconnect", socket.id)
    delete players[socket.id]
  })

  socket.on("msg", msg => {
    io.emit("msg", msg)
  })

  socket.on("name", name => {
    socket.broadcast.emit("newPlayer", createPlayer(name, socket.id))
    socket.emit("currentPlayers", players)
  })

  socket.on(
    "move",
    ({ x, y }) =>
      socket.id in players &&
      socket.broadcast.emit("playerMove", {
        id: socket.id,
        x: (players[socket.id].x = x),
        y: (players[socket.id].y = y)
      })
  )

  socket.on("rotate", ({ turret_r }) => {
      socket.id in players &&
      socket.broadcast.emit("playerRotate", {
        id: socket.id,
        turret_r: (players[socket.id].turret_r = turret_r)
      })
})
})

const createPlayer = (name, id) =>
  (players[id] = {
    name,
    color: `hsl(${Math.floor(Math.random() * 360)},69%,54%)`,
    id,
    x: 0,
    y: 0,
    turret_r: Math.PI / 2,
    camera_r: 0,
    speed: 5,
    vx: 0,
    vy: 0,
    size: 25,
    hp: 100
  })

http.listen(8181, () => console.log("listening on *:8181"))
