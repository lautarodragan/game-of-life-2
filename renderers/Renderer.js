import { WorldRenderer } from './WorldRenderer.js'

export const Renderer = (gl, game) => {
  const worldRenderer = WorldRenderer(gl, game)

  const viewportSize = {
    width: 0,
    height: 0,
  }

  gl.clearColor(0, 0, 0, 1)
  gl.clearDepth(1)
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  function render(camera) {
    gl.clear(gl.COLOR_BUFFER_BIT)
    worldRenderer.render(camera)
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
  }
}
