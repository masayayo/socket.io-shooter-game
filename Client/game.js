import { game, key, addMsg, sendMsg, canUpdatePhysics } from "./lib.js"
import { realtime, socket } from "./consts.js"

export const initGame = (config) => {
  game.camera.position.set(game.width / 2, game.height / 2, 100)
  game.renderer.setSize(game.width, game.height)
  document.body.appendChild(game.renderer.domElement)
  game.scene.background = new THREE.Color(0x0a0e14)

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

  loadCharacterSelectScreen(config)
}

export const update = () => {
  // update your shit, and draw all
  if (canUpdatePhysics(windowVisible)) {
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

function loadCharacterSelectScreen(config) {
  let characterSelection = document.getElementById("character-selection")

  for (let key in config.playerClasses) {
    let wrapper = document.createElement("div")
    wrapper.classList.add("character-wrapper")

    let character = document.createElement("a")
    character.classList.add("character-select")
    character.value = key
    wrapper.appendChild(character)

    let img = document.createElement("img")
    img.classList.add("character-image")
    img.src = config.playerClasses[key].sprite.path
    img.style.backgroundImage = "url(" + config.playerClasses[key].sprite.path + ")"
    img.style.backgroundSize = "400%, 400%"
    character.appendChild(img)

    let text = document.createElement("h3")
    text.textContent = config.playerClasses[key].name
    character.appendChild(text)

    characterSelection.appendChild(wrapper)
    character.addEventListener("click", characterSelected);
  }
}

function characterSelected(){
  document.getElementsByClassName("container")[0].remove()
  socket.emit("name", this.value)
}

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange, windowVisible = true;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
  if (document[hidden]) {
    windowVisible = false
  } else {
    windowVisible = true
    realtime.startTime = new Date().getTime()
    realtime.deltaTime = 0
  }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}
