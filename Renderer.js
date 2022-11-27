export const Renderer = (game, gl) => {
  gl.clearDepth(1)
  gl.disable(gl.DEPTH_TEST)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  function drawRect(x, y, width, height, color) {
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, width, height);
    gl.clearColor(...color, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST)
  }

  function renderCircle(x, y, w, h) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionsWorld(x, y, w, h), gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function render(camera) {
    // gl.clearColor(.5, .5, .5, 1)
    gl.clearColor(0, 0, 0, .01)
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let x = 0; x < game.width; x++)
      for (let y = 0; y < game.height; y++)
        drawRect(
          x * camera.z + camera.x,
          y * camera.z + camera.y,
          camera.z,
          camera.z,
          game.getValue(x, y) ? [Math.random(), Math.random(), Math.random()] : [0, 0, 0],
        )
  }

  function setViewPortSize(width, height) {
    gl.viewport(0, 0, width, height)
  }

  return {
    render,
    setViewPortSize,
  }
}
