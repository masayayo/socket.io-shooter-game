import { addPlayer, game, socket,addMsg } from "./lib.js"

socket.on("newPlayer", (player) => addPlayer(player))
socket.on("currentPlayers", (players) =>
  Object.entries(players).forEach(([key, val]) => addPlayer(val))
)
socket.on("playerMove", ({ id, x, y }) => {
  if (!(id in game.players)) return
  game.players[id].x = x
  game.players[id].y = y
})
socket.on("playerRotate", ({ id, r }) => {
  if (!(id in game.players)) return
  game.players[id].r = r
})
// socket.on("playerBullet")
socket.on("playerDisconnect", (id) => {
  game.scene.remove(game.players[id].main)
  game.scene.remove(game.players[id].hpbar)
  delete game.players[id]
})
socket.on('msg',msg=>addMsg(msg))
