import { WorldProgram } from '../programs/WorldProgram.js'

export const WorldRenderer = (device, format, game, camera) => {
  const program = WorldProgram(device, format, game.getStateBuffers())
  const instanceCount = game.width * game.height
  const frameColor = new Float32Array(3)

  function render(pass) {
    // One random color per render frame, shared by every fully-alive cell.
    // Decaying cells use their own remembered color (frozen at the moment of death).
    frameColor[0] = Math.random()
    frameColor[1] = Math.random()
    frameColor[2] = Math.random()
    game.setCurrentColor(frameColor)

    program.setCamera(camera, game.width, game.height, frameColor)
    program.render(pass, game.getCurrentIndex(), instanceCount)
  }

  function setResolution(_w, _h) {}

  return { render, setResolution }
}
