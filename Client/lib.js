import { FPS, realtime, socket, directions } from "./consts.js"

export class Player {
  constructor({
    config,
    name,
    color,
    x,
    vx,
    vy,
    y,
    direction_r,
    camera_r,
    speed,
    size,
    id,
    hp,
    facing
  }) {
    this.config = config
    this.name = name
    this.color = color
    this.x = x
    this.y = y
    this.direction_r = direction_r
    this.camera_r = camera_r
    this.rotation_speed = Math.PI / 72
    this.vx = vx || 0
    this.vy = vy || 0
    this.id = id
    this.speed = speed
    this.player = new THREE.Group()
    this.hpbarWrapper = new THREE.Group()
    this.main = new THREE.Group()
    this.sprite = new THREE.Mesh(geometry.direction, material.direction)
    this.direction = null
    this.hpbar = new THREE.Mesh(
      geometry.hpbar,
      new THREE.MeshBasicMaterial({
        color: `hsl(${hp},69%,54%)`
      })
    )
    this.size = size
    this.hp = hp
    this.canAnimate = true
    this.facing = facing
    this.moving = false
  }
  update() {
    this.move()
    this.direction_r = Math.atan2(
      game.my - game.height / 2,
      game.mx - game.width / 2
    )

    if(key.isDown("mouse")) {
      let dir = new THREE.Vector3(Math.round(Math.cos(this.direction_r)), Math.round(Math.sin(this.direction_r)),0)
      this.facing = dir
      this.rotateSprite(dir)
    }

    this.x += this.vx
    this.y += this.vy

    game.camera.position.x = this.x
    game.camera.position.y = this.y
    game.camera.rotation.z = this.camera_r
  }
  draw() {
    this.main.rotation.z = this.direction_r - Math.PI / 2

    this.player.position.x = this.x
    this.player.position.y = this.y

    
    this.hpbar.scale.x = this.hp / 100
    this.hpbar.material.color.set(`hsl(${this.hp},69%,54%)`)
  }
  move() {
    this.camera_r +=
      (key.isDown(key.Q) - key.isDown(key.E)) * this.rotation_speed
    let dir = new THREE.Vector3(
      key.isDown(key.RIGHT) - key.isDown(key.LEFT),
      key.isDown(key.UP) - key.isDown(key.DOWN),
      0
    )
    dir.normalize()
    
    // In case only moving with keyboard just rotate the sprite to the closest vector UP,DOWN,LEFT,RIGHT based on dir
    if(!key.isDown("mouse")){
      if(dir.x !== 0 || dir.y !== 0) {
        this.rotateSprite(dir)
        this.facing = dir
        this.moving = true
      }else{
        this.moving = false
      }
    }

    let angle = new THREE.Euler(0, 0, this.camera_r, "XYZ")
    dir.applyEuler(angle)

    this.rotateSpriteCamera()
    
    this.vx = dir.x * this.speed
    this.vy = dir.y * this.speed
  }
  animateSprite(moving){
    if(moving) {
      if(this.isAnimatable() === true){
        let offsetX = this.sprite.material.map.offset.x + (1 / this.config.sprite.animationTiles)
        
        if(offsetX >= 1){
          offsetX = 0 // Left side of the spritesheet - idle animation tile
        }
        this.sprite.material.map.offset.x = offsetX

        this.canAnimate = false
        var player = this
        setTimeout(function(){player.setCanAnimate()}, this.config.sprite.animationSpeed)
      }
    }else{
      this.sprite.material.map.offset.x = 0
    }
  }
  rotateSprite(dir){
      let offsetY = this.sprite.material.map.offset.y

      if(dir){
        dir.x = Math.round(dir.x)
        dir.y = Math.round(dir.y)

        if(dir.x === directions.UP.x && dir.y === directions.UP.y){
          offsetY = 0
        } else if(dir.x === directions.RIGHT.x && dir.y === directions.RIGHT.y){
          offsetY = 1/4
        } else if(dir.x === directions.LEFT.x && dir.y === directions.LEFT.y){
          offsetY = 2/4
        } else if(dir.x === directions.DOWN.x && dir.y === directions.DOWN.y){
          offsetY = 3/4
        }
      }else{
        offsetY = 0
      }

      this.sprite.material.map.offset.y = offsetY
    
  }
  rotateSpriteCamera(rotation){
    this.player.rotation.z = rotation
    this.hpbarWrapper.rotation.z = game.client.camera_r - rotation
  }
  isAnimatable(){
    return this.canAnimate
  }
  isMoving(){
    return this.moving
  }
  setMoving(value){
    this.moving = value
  } 
  setCanAnimate(){
    this.canAnimate = true
  }
}
export const game = {
  players: {},
  width: window.innerWidth,
  height: window.innerHeight,
  mx: window.innerWidth / 2,
  my: window.innerHeight,
  scene: new THREE.Scene(),
  camera: new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    1,
    1000
  ),
  renderer: new THREE.WebGLRenderer({ antialias: true })
}
export const geometry = {
  hpbar: new THREE.PlaneGeometry(50, 5),
  player: new THREE.PlaneBufferGeometry(),
  direction: new THREE.PlaneBufferGeometry(),
  bullet: new THREE.CircleGeometry(5, 8)
}
export const material = {
  direction: new THREE.MeshBasicMaterial({ color: 0xb3b1ad })
}
export const key = {
  _pressed: {},

  LEFT: 65,
  UP: 87,
  RIGHT: 68,
  DOWN: 83,
  Q: 81,
  E: 69,

  isDown: keyCode => {
    return key._pressed[keyCode] ? 1 : 0
  },

  onKeyDown: event => {
    key._pressed[event.keyCode] = true
  },

  onMouseDown: event => {
    key._pressed["mouse"] = true
  },

  onKeyUp: event => {
    delete key._pressed[event.keyCode]
  },

  onMouseUp: event => {
    delete key._pressed["mouse"]
  }
}

export const addPlayer = player => {
  let p = new Player(player)
  
  // Load and add sprites
  let playerSprite = new THREE.TextureLoader().load( p.config.sprite.path )
  let playerMaterial = new THREE.MeshBasicMaterial( { map: playerSprite ,opacity: 1, transparent: true } )

  let playerMesh = new THREE.Mesh( geometry.player, playerMaterial )
  playerMesh.position.x = p.x
  playerMesh.position.y = p.y
  playerMesh.scale.x = 48
  playerMesh.scale.y = 48
  playerMesh.scale.z = 1
  playerMesh.material.map.offset.set(0, 0)
  playerMesh.material.map.repeat.set(1 / p.config.sprite.animationTiles, 1 / p.config.sprite.animationTiles)
  p.sprite = playerMesh
  p.moving = false
  
  let directionSprite = new THREE.TextureLoader().load( "./sprites/arrow.png" )
  let directionMaterial = new THREE.MeshBasicMaterial( { map: directionSprite ,opacity: 0.9, transparent: true } );
  let directionMesh = new THREE.Mesh( geometry.direction, directionMaterial );
  directionMesh.position.x = p.x
  directionMesh.position.y = p.y
  directionMesh.scale.x = 48
  directionMesh.scale.y = 48
  directionMesh.scale.z = 1
  p.direction = directionMesh
  

  p.direction_r = Math.PI / 2
  p.direction.rotation.z = 0//p.direction_r
  
  p.sprite.position.set(0, p.size - 8, 0)
  p.direction.position.set(0,0,0)
  p.hpbar.position.set(0, -(p.size)/*-(p.size + 20)*/, 0)

  //add to scene
  p.player.add(p.main)
  p.player.add(p.hpbarWrapper)
  p.hpbarWrapper.add(p.hpbar)
  p.player.add(p.sprite)
  p.main.add(p.direction)
  game.scene.add(p.player)

  game.players[p.id] = p
}

export const addMsg = msg => {
  let a = document.createElement("li")
  a.textContent = msg
  document.getElementById("msg").appendChild(a)
}

export const sendMsg = event => {
  event.stopPropagation()
  let inp = document.getElementById("msgin").value
  if (event.keyCode === 13 && inp) {
    socket.emit("msg", inp)
    document.getElementById("msgin").value = ""
  }
}

export const canUpdatePhysics = () => {
  realtime.deltaTime += new Date().getTime() - realtime.startTime
  if (realtime.deltaTime > FPS) {
    realtime.deltaTime -= FPS
    return true
  }
  return false
}
