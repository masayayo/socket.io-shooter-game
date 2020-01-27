export class Player {
  constructor({
    name,
    color,
    x,
    vx,
    vy,
    y,
    r,
    speed,
    size,
    shootspeed,
    bullets,
    id,
    hp
  }) {
    this.name = name
    this.color = color
    this.x = x
    this.y = y
    this.r = r
    this.vx = vx || 0
    this.vy = vy || 0
    this.id = id
    this.speed = speed
    this.main = new THREE.Group()
    this.tank = new THREE.Mesh(
      geometry.player,
      new THREE.MeshBasicMaterial({ color })
    )
    this.turret = new THREE.Mesh(geometry.turret, material.turret)
    this.hpbar = new THREE.Mesh(
      geometry.hpbar,
      new THREE.MeshBasicMaterial({ color: `hsl(${hp},69%,54%)` })
    )
    this.bullets = bullets
    this.shootspeed = shootspeed
    this.size = size
    this.hp = hp
  }
  update() {
    this.r = Math.atan2(game.my - game.height / 2, game.mx - game.width / 2)
    this.move()
    this.x += this.vx
    this.y += this.vy
    game.camera.position.x = this.main.position.x
    game.camera.position.y = this.main.position.y
  }
  draw() {
    this.main.rotation.z = this.r
    this.main.position.set(this.x, this.y, 0)

    this.hpbar.position.set(this.x, this.y - this.size - 20, 0)
    this.hpbar.scale.x = this.hp / 100
    this.hpbar.material.color.set(`hsl(${this.hp},69%,54%)`)
  }
  move() {
    let m = (key.isDown(key.UP) - key.isDown(key.DOWN)) * this.speed
    this.vy = Math.sin(this.r) * m
    this.vx = Math.cos(this.r) * m
  }
}
export const game = {
  players: {},
  width: window.innerWidth,
  height: window.innerHeight,
  mx: 0,
  my: 0,
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
  player: new THREE.CircleGeometry(25, 8),
  turret: new THREE.PlaneGeometry(16, 20),
  bullet: new THREE.CircleGeometry(5, 8)
}
export const material = {
  turret: new THREE.MeshBasicMaterial({ color: 0xb3b1ad })
}
export const key = {
  _pressed: {},

  LEFT: 65,
  UP: 87,
  RIGHT: 68,
  DOWN: 83,

  isDown: (keyCode) => {
    return key._pressed[keyCode] ? 1 : 0
  },

  onKeyDown: (event) => {
    key._pressed[event.keyCode] = true
  },

  onKeyUp: (event) => {
    delete key._pressed[event.keyCode]
  }
}

export const addPlayer = (player) => {
  let p = new Player(player)
  // align turret in group
  p.turret.rotation.z = p.main.rotation.z = p.tank.rotation.z =
    p.r - Math.PI / 2
  p.turret.position.set(Math.cos(p.r) * p.size, Math.sin(p.r) * p.size, 0)
  //add to scene
  p.main.add(p.tank)
  p.main.add(p.turret)
  game.scene.add(p.main)
  game.scene.add(p.hpbar)

  game.players[p.id] = p
  console.log(p.id)
}

export const socket = io()

export const addMsg = msg => {
  let a=document.createElement('li')
  a.textContent=msg
  document.getElementById('msg').appendChild(a)
}

export const sendMsg = event => {
  event.stopPropagation()
  let inp = document.getElementById('msgin').value
  if (event.keyCode == 13 && inp) {
    socket.emit('msg', inp)
    document.getElementById('msgin').value = ""
  }
}
