import { addPlayer, addBullet, game, addMsg } from "./lib.js"
import { socket } from "./consts.js"
import { update } from "./game.js"

socket.on("newPlayer", player => {
  addPlayer(player)
})
socket.on("currentPlayers", ({ players, bullets }) => {
  Object.values(players).forEach(p => addPlayer(p))
  Object.values(bullets).forEach(p => addBullet(p))
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
socket.on("createBullet", b => {
  addBullet(b)
})
socket.on("killBullet", id => {
  if (inArray(id, game.bullets)) {
    game.bullets[id].killBullet()
  }
})
socket.on("msg", msg => addMsg(msg))

function inArray(needle, haystack) {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if (haystack[i] == needle) return true;
  }
  return false;
}