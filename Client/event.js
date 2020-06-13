import { addPlayer, game, addMsg } from "./lib.js"
import { socket } from "./consts.js"
import { update } from "./game.js"

socket.on("newPlayer", player => {
  addPlayer(player)
})
socket.on("currentPlayers", players => {
  Object.values(players).forEach(p => addPlayer(p))
  game.client = game.players[socket.id]
  update()
})
socket.on("playerMove", ({ id, x, y, facing, moving }) => {
  if (!(id in game.players)) return
  game.players[id].x = x
  game.players[id].y = y
  game.players[id].facing = facing
  game.players[id].moving = moving
})
socket.on("playerRotate", ({ id, direction_r, camera_r }) => {
  if (!(id in game.players)) return
  game.players[id].direction_r = direction_r
  game.players[id].camera_r = camera_r
})
socket.on("playerDisconnect", id => {
  game.scene.remove(game.players[id].player)
  delete game.players[id]
})
socket.on("msg", msg => addMsg(msg))
