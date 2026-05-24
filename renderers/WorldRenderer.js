import { WorldProgram } from '../programs/WorldProgram.js'

export const WorldRenderer = (device, format, game, camera) => {
  const program = WorldProgram(device, format, game.getStateBuffers())
  const instanceCount = game.width * game.height

  function render(pass) {
    program.setCamera(camera, game.width, game.height)
    program.render(pass, game.getCurrentIndex(), instanceCount)
  }

  function setResolution(_w, _h) {
    // Resolution is read from `camera.w`/`camera.h` each frame in setCamera; nothing to do here.
  }

  return { render, setResolution }
}
