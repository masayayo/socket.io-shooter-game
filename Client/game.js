import { game, key, socket, addMsg, sendMsg } from "./lib.js"

const init = () => {
  game.camera.position.set(game.width / 2, game.height / 2, 100)
  game.renderer.setSize(game.width, game.height)
  document.body.appendChild(game.renderer.domElement)
  game.scene.background = new THREE.Color(0x0a0e14)

  //listeners
  window.addEventListener("keyup", key.onKeyUp, false)
  window.addEventListener("keydown", key.onKeyDown, false)
  window.addEventListener("mousemove", (event) => {
    game.mx = event.pageX
    game.my = game.height - event.pageY
  })
  document.getElementById('msgin').addEventListener('keydown', sendMsg,false)

  //grid
  var size = 10000;
  var divisions = 100;

  var gridHelper = new THREE.GridHelper(size, divisions,0xaaccc8,0x446658);
  gridHelper.rotation.x=Math.PI*1.5
  gridHelper.position.z=-1
  game.scene.add(gridHelper);

  //register
  socket.emit("name", "kms")
  update()
}

const update = () => {
  // upddate your shit, and draw all
  if (Object.entries(game.players).length !== 0) {
    game.players[socket.id].update()
    Object.entries(game.players).forEach(([k, x]) => {
      x.draw()
    })

    game.renderer.render(game.scene, game.camera)

    socket.emit("move", {
      x: game.players[socket.id].x,
      y: game.players[socket.id].y
    })
    socket.emit("rotate", { r: game.players[socket.id].r })
  }
  requestAnimationFrame(update)
}

window.addEventListener("load", init)
