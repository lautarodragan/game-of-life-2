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

  const positionBuffer = gl.createBuffer()
  const colorBuffer = gl.createBuffer()

  const positionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(positionAttribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

  const colorAttribute = gl.getAttribLocation(program, 'vColor');
  gl.enableVertexAttribArray(colorAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 0, 0);

  const positionsScreen = (x, y, w, h) => new Float32Array([
    x,     (y+h),
    (x+w), (y+h),
    x,     y,
    (x+w), y,
    x,     y,
    (x+w), (y+h),
  ])

  const randomColorWithDecay = (x, y) => Math.random() * game.getValue(x, y) / 0xff

  function render(camera) {
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const positions = []
    const colors = []

    for (let x = 0; x < game.width; x++)
      for (let y = 0; y < game.height; y++) {
        const life = game.getValue(x, y)

        if (!life)
          continue

        const r = Math.random() * life / 0xff
        const g = Math.random() * life / 0xff
        const b = Math.random() * life / 0xff

        for (let j = 0; j < 6; j++) { // repeated so each point of the 2 triangles has the same color
          colors.push(r)
          colors.push(g)
          colors.push(b)
        }

        const vertices = positionsScreen(
          x * camera.z - camera.x + camera.w / 2 - game.width / 2 * camera.z,
          y * camera.z - camera.y + camera.h / 2 - game.height / 2 * camera.z,
          camera.z,
          camera.z,
        )
        positions.push(...vertices)

      }


    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLES, 0, positions.length)
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
