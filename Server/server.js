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
  socket.emit("init", config)

  socket.on("disconnect", () => {
    io.emit("playerDisconnect", socket.id)
    delete players[socket.id]
  })

  socket.on("msg", msg => {
    io.emit("msg", socket.id + ": " + msg)
  })

  socket.on("name", name => {
    socket.emit("newPlayer", {playerConfig: config.playerClasses[name], name: name, id: socket.id})
  })

  socket.on("newPlayerAdded", newPlayer => {
    players[socket.id] = newPlayer
    io.emit("currentPlayers", players) // Will probably be changed to io.in().emit() later when introducing rooms/
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

http.listen(8181, () => console.log("listening on *:8181"))
