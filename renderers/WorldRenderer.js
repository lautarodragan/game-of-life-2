import { WorldProgram } from '../programs/WorldProgram.js'

export const CellShape = {
  Squares: 0,
  Circles: 1,
}
const CELL_SHAPE_CYCLE = [CellShape.Squares, CellShape.Circles]

export const WorldRenderer = (device, format, game, camera) => {
  const program = WorldProgram(device, format, game.getStateBuffers())
  const instanceCount = game.width * game.height
  const frameColor = new Float32Array(3)
  let cellShape = CellShape.Squares

  function render(pass) {
    frameColor[0] = Math.random()
    frameColor[1] = Math.random()
    frameColor[2] = Math.random()
    game.setCurrentColor(frameColor)

    program.setCamera(camera, game.width, game.height, frameColor, cellShape)
    program.render(pass, game.getCurrentIndex(), instanceCount)
  }

  function setResolution(_w, _h) {}

  function cycleCellShape() {
    const i = CELL_SHAPE_CYCLE.indexOf(cellShape)
    cellShape = CELL_SHAPE_CYCLE[(i + 1) % CELL_SHAPE_CYCLE.length]
  }

  return {
    render,
    setResolution,
    cycleCellShape,
    get cellShape() { return cellShape },
    set cellShape(_) { cellShape = _ },
  }
}
