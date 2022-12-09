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

  const colors = new Float32Array(game.width * game.height * 6 * 3) // 6 points, 3 color components each (rgb)
  const positions = new Float32Array(game.width * game.height * 6 * 2) // 6 points, 2 coordinate components each (x, y)

  const uResolution = gl.getUniformLocation(program, 'uResolution')

  const positionBuffer = gl.createBuffer()
  const colorBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, colors.length, gl.DYNAMIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions.length, gl.DYNAMIC_DRAW)

  const positionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(positionAttribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 3 * 4 * 4, 0)
  gl.vertexAttribDivisor(positionAttribute, 1)

  const colorAttribute = gl.getAttribLocation(program, 'vColor');
  gl.enableVertexAttribArray(colorAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorAttribute, 3, gl.FLOAT, false, 3 * 4, 0);
  gl.vertexAttribDivisor(colorAttribute, 1)

  const positionsScreen = (x, y, w, h) => new Float32Array([
    x,     (y+h),
    (x+w), (y+h),
    x,     y,
    (x+w), y,
    x,     y,
    (x+w), (y+h),
  ])

  const randomColorWithDecay = (life) => new Float32Array([
    Math.random() * life / 0xff,
    Math.random() * life / 0xff,
    Math.random() * life / 0xff,
  ])

  function render(camera) {
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let x = 0; x < game.width; x++) {
      for (let y = 0; y < game.height; y++) {
        const life = game.getValue(x, y)

        // if (!life)
        //   continue

        const liveCellIndex = x + y * game.width

        const rgb = randomColorWithDecay(life)

        for (let i = 0; i < 6; i++) { // for each point in the square
          for (let j = 0; j < 3; j++) { // for each color component
            colors[liveCellIndex * 6 * 3 + i * 3 + j] = rgb[j]
          }
        }

        const vertices = positionsScreen(
          x * camera.z - camera.x + camera.w / 2 - game.width / 2 * camera.z,
          y * camera.z - camera.y + camera.h / 2 - game.height / 2 * camera.z,
          camera.z,
          camera.z,
        )

        for (let i = 0; i < 6; i++) { // for each point in the square
          for (let j = 0; j < 2; j++) { // for each color component
            positions[liveCellIndex * 6 * 2 + i * 2 + j] = vertices[i * 2 + j]
          }
        }

      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)

    gl.drawArraysInstanced(gl.TRIANGLES, 0, positions.length, 1)
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
