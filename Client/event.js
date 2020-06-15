import { addPlayer, game, addMsg } from "./lib.js"
import { socket } from "./consts.js"
import { initGame, update } from "./game.js"

socket.on("init", (config) => {
  initGame(config)
})

socket.on("newPlayer", ({ playerConfig, name, id}) => {
  let newPlayer = addPlayer(playerConfig, name, id)
  socket.emit("newPlayerAdded", newPlayer)
})
socket.on("currentPlayers", players => {
  Object.values(players).forEach(p => {
    // Check if player already exist
    if(!game.players[p.id]) {
      // Don't need the return in this case
      addPlayer(p.config, p.name, p.id)
    }
  })
  game.client = game.players[socket.id]
  if(game.players[socket.id]){
    update()
  }
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
  if(game.players[id]) {
    game.scene.remove(game.players[id].player)
    delete game.players[id]
  }else{
    delete game.players[id]
  }
})
socket.on("msg", msg => addMsg(msg))
