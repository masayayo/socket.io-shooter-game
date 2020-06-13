export const FPS = 1000.0 / 60.0
export const realtime = {
  startTime: new Date().getTime(),
  deltaTime: 0
}
export const socket = io()
