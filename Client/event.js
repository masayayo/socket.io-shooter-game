import { addPlayer, game, addMsg } from "./lib.js"
import { socket } from "./consts.js"
import { update } from "./game.js"

socket.on("newPlayer", player => {
  addPlayer(player)
})
socket.on("currentPlayers", players => {
  Object.entries(players).forEach(([key, val]) => addPlayer(val))
  game.client = game.players[socket.id]
  update()
})
socket.on("playerMove", ({ id, x, y }) => {
  if (!(id in game.players)) return
  game.players[id].x = x
  game.players[id].y = y
})
socket.on("playerRotate", ({ id, turret_r }) => {
  if (!(id in game.players)) return
  game.players[id].turret_r = turret_r
})
// socket.on("playerBullet")
socket.on("playerDisconnect", id => {
  game.scene.remove(game.players[id].player)
  delete game.players[id]
})
socket.on("msg", msg => addMsg(msg))
