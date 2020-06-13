export const FPS = 1000.0 / 60.0
export const realtime = {
  startTime: new Date().getTime(),
  deltaTime: 0
}
export const socket = io()
export const directions = {
  LEFT: new THREE.Vector3(-1,0,0),
  RIGHT: new THREE.Vector3(1,0,0),
  UP: new THREE.Vector3(0,1,0),
  DOWN: new THREE.Vector3(0,-1,0)
}