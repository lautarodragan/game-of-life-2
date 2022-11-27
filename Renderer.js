import { createProgram } from './createProgram.js'

export const Renderer = (game, gl) => {
  const program = createProgram(gl)

  const viewportSize = {
    width: 0,
    height: 0,
  }

  gl.clearDepth(1)
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  const uColor = gl.getUniformLocation(program, 'uColor')
  const uResolution = gl.getUniformLocation(program, 'uResolution')

  const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(aVertexPosition)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)

  const positionsScreen = (x, y, w, h) => new Float32Array([
    x,     (y+h),
    (x+w), (y+h),
    x,     y,
    (x+w), y,
  ])

  function drawRect(x, y, w, h, color) {
    gl.uniform4f(uColor, ...color)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionsScreen(x, y, w, h), gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function render(camera) {
    // gl.clearColor(.5, .5, .5, 1)
    // gl.clearColor(0, 0, 0, .01)
    // gl.clear(gl.COLOR_BUFFER_BIT)

    for (let x = 0; x < game.width; x++)
      for (let y = 0; y < game.height; y++)
        if (game.getValue(x, y))
          drawRect(
            x * camera.z + camera.x,
            y * camera.z + camera.y,
            camera.z,
            camera.z,
            [Math.random(), Math.random(), Math.random(), 1],
          )
  }

  function setViewPortSize(width, height) {
    gl.viewport(0, 0, width, height)
    viewportSize.width = width
    viewportSize.height = height
    gl.uniform2f(uResolution, width, height)
  }

  return {
    render,
    setViewPortSize,
  }
}
