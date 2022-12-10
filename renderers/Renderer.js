import { WorldRenderer } from './WorldRenderer.js'
import { HeadsUpDisplayRenderer } from './HeadsUpDisplayRenderer.js'

export const Renderer = (gl, game, camera) => {
  const worldRenderer = WorldRenderer(gl, game, camera)
  const headsUpDisplayRenderer = HeadsUpDisplayRenderer(gl)

  const viewportSize = {
    width: 0,
    height: 0,
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clearDepth(1)
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT)
    worldRenderer.render()
    headsUpDisplayRenderer.render()
  }

  function setViewPortSize(width, height) {
    gl.viewport(0, 0, width, height)
    viewportSize.width = width
    viewportSize.height = height
    worldRenderer.setResolution(width, height)
  }

  return {
    render,
    setViewPortSize,
    setFPS: headsUpDisplayRenderer.setFPS,
  }
}
