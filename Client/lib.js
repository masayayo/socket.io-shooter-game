import { FPS, realtime, socket } from "./consts.js"
import { distanceToPoint } from "./util.js"

export class Bullet {
  constructor({
    id,
    color,
    x,
    y,
    parent,
    size,
    speed,
    range,
    r
  }) {
    this.id = id
    this.color = color
    this.x = x
    this.y = y
    this.parent = parent
    this.size = size
    this.speed = speed
    this.range = range
    this.r = r
    this.sx = x
    this.sy = y
    this.vx = Math.cos(r) * speed
    this.vy = Math.sin(r) * speed
    this.object = new THREE.Mesh(geometry.bullet, new THREE.MeshBasicMaterial({ color, wireframe: true }))
    game.scene.add(this.object)
    this.object.position.set(x, y, 0)
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    this.object.position.set(this.x, this.y, 0)
    let a = (distanceToPoint(this.sx, this.sy, this.x, this.y))
    if (a > this.range) {
      game.scene.remove(this.object)
      delete this.parent.bullets[this.object.id]
    }
  }
}

export class Player {
  constructor({
    name,
    color,
    x,
    vx,
    vy,
    y,
    turret_r,
    camera_r,
    speed,
    size,
    id,
    hp,
    bulletSize,
    bulletSpeed,
    bulletRange
  }) {
    this.name = name
    this.color = color
    this.x = x
    this.y = y
    this.turret_r = turret_r
    this.camera_r = camera_r
    this.rotation_speed = Math.PI / 72
    this.vx = vx || 0
    this.vy = vy || 0
    this.id = id
    this.speed = speed
    this.player = new THREE.Group()
    this.hpbarWrapper = new THREE.Group()
    this.main = new THREE.Group()
    this.tank = new THREE.Mesh(
      geometry.player,
      new THREE.MeshBasicMaterial({ color, wireframe: true })
    )
    this.turret = new THREE.Mesh(geometry.turret, material.turret)
    this.hpbar = new THREE.Mesh(
      geometry.hpbar,
      new THREE.MeshBasicMaterial({
        color: `hsl(${hp},69%,54%)`
      })
    )
    this.size = size
    this.hp = hp
    this.shootTime = true
    this.fireRate = 1000
    this.bullets = {}
    this.bulletSize = bulletSize
    this.bulletSpeed = bulletSpeed
    this.bulletRange = bulletRange
  }
  update() {
    Object.values(this.bullets).forEach(x => x.update())
    this.move()
    this.turret_r = Math.atan2(
      game.my - game.height / 2,
      game.mx - game.width / 2
    )
    this.x += this.vx
    this.y += this.vy

    if (this.canShoot()) {
      this.shoot()
    }

    game.camera.position.x = this.x
    game.camera.position.y = this.y
    game.camera.rotation.z = this.camera_r
  }
  canShoot() {
    return key.isDown("mouse") && this.shootTime
  }

  shoot() {
    let b = new Bullet({
      color: this.color,
      x: this.x,
      y: this.y,
      parent: this,
      size: this.bulletSize,
      speed: this.bulletSpeed,
      range: this.bulletRange,
      r: this.turret_r + this.camera_r
    })
    this.bullets[b.object.id] = b
    this.shootTime = false
    setTimeout(_ => this.shootTime = true, this.fireRate)
  }

  draw() {
    this.player.rotation.z = this.camera_r
    this.main.rotation.z = this.turret_r - Math.PI / 2

    this.player.position.x = this.x
    this.player.position.y = this.y

    this.hpbarWrapper.rotation.z = game.client.camera_r - this.camera_r
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
    let angle = new THREE.Euler(0, 0, this.camera_r, "XYZ")
    dir.applyEuler(angle)

    this.vx = dir.x * this.speed
    this.vy = dir.y * this.speed
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
  player: new THREE.CircleGeometry(25, 8),
  turret: new THREE.PlaneGeometry(20, 16),
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
  // align turret in group
  p.turret_r = Math.PI / 2
  p.turret.rotation.z = p.tank.rotation.z = p.turret_r

  p.turret.position.set(
    Math.cos(p.turret_r) * p.size,
    Math.sin(p.turret_r) * p.size,
    0
  )
  p.hpbar.position.set(0, -(p.size + 20), 0)

  //add to scene
  p.player.add(p.main)
  p.player.add(p.hpbarWrapper)
  p.hpbarWrapper.add(p.hpbar)
  p.main.add(p.tank)
  p.main.add(p.turret)
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
  if (event.keyCode == 13 && inp) {
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
