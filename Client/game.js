import { game, key, addMsg, sendMsg, canUpdatePhysics } from "./lib.js"
import { realtime, socket } from "./consts.js"

const init = () => {
  game.camera.position.set(game.width / 2, game.height / 2, 100)
  game.renderer.setSize(game.width, game.height)
  document.body.appendChild(game.renderer.domElement)
  game.scene.background = new THREE.Color(0x0a0e14)

  //listeners
  window.addEventListener("keyup", key.onKeyUp, false)
  window.addEventListener("keydown", key.onKeyDown, false)
  window.addEventListener("mousemove", event => {
    game.mx = event.pageX
    game.my = game.height - event.pageY
  })
  window.addEventListener("mousedown", key.onMouseDown, false)
  window.addEventListener("mouseup", key.onMouseUp, false)
  document.getElementById("msgin").addEventListener("keydown", sendMsg, false)

  //grid
  var size = 10000
  var divisions = 100

  var gridHelper = new THREE.GridHelper(size, divisions, 0xaaccc8, 0x446658)
  gridHelper.rotation.x = Math.PI / 2
  gridHelper.position.z = -1
  game.scene.add(gridHelper)

  //register
  socket.emit("name", "kms")
}
export const update = () => {
  // update your shit, and draw all
  if (canUpdatePhysics()) {
    // Physics
    game.client.update()
    socket.emit("move", {
      x: game.client.x,
      y: game.client.y,
      facing: game.client.facing,
      moving: game.client.moving
    })
    socket.emit("rotate", { 
      direction_r: game.client.direction_r,
      camera_r: game.client.camera_r
     })
  }


  // Draw
  Object.entries(game.players).forEach(([k, x]) => {
    x.draw()
    if(k !== game.client.id){
      x.main.rotation.z -= game.client.camera_r
      x.direction.rotation.z = x.camera_r
      x.rotateSprite(x.facing)
    }
    x.animateSprite(x.moving)
    x.rotateSpriteCamera(game.client.camera_r)
    
  })
  game.renderer.render(game.scene, game.camera)

  // Reset startTime
  realtime.startTime = new Date().getTime()

  requestAnimationFrame(update)
}

window.addEventListener("load", init)
