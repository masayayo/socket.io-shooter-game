const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const config = require("./playerConfig.json")


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
    io.emit("msg", socket.id + ": " + msg)
  })

  socket.on("name", name => {
    socket.broadcast.emit("newPlayer", createPlayer(config.playerClasses.blue, name, socket.id))
    socket.emit("currentPlayers", players)
  })

  socket.on(
    "move",
    ({ x, y, facing, moving }) =>
      socket.id in players &&
      socket.broadcast.emit("playerMove", {
        id: socket.id,
        x: (players[socket.id].x = x),
        y: (players[socket.id].y = y),
        facing: (players[socket.id].facing = facing),
        moving: (players[socket.id].moving = moving)
      })
  )

  socket.on("rotate", ({ direction_r, camera_r }) => {
    socket.id in players &&
      socket.broadcast.emit("playerRotate", {
        id: socket.id,
        direction_r: (players[socket.id].direction_r = direction_r),
        camera_r: (players[socket.id].camera_r = camera_r)
      })
  })
})

const createPlayer = (config, name, id) =>
  (players[id] = {
    config: config,
    name,
    color: `hsl(${Math.floor(Math.random() * 360)},69%,54%)`,
    id,
    x: 0,
    y: 0,
    direction_r: Math.PI / 2,
    camera_r: 0,
    speed: 5,
    vx: 0,
    vy: 0,
    size: 25,
    hp: 100,
    facing: null
  })

http.listen(8181, () => console.log("listening on *:8181"))
