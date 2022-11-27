import { createProgram } from './createProgram.js'
import { GameOfLife } from './GameOfLife.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  window.canvas = canvas
  const gl = canvas.getContext('webgl2',  { alpha: false })

  const program = createProgram(gl)
  const game = new GameOfLife(20, 20)
  const zoom = 40
  let paused = true

  gl.clearDepth(1)
  gl.disable(gl.DEPTH_TEST)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)


  function renderCircle(x, y, w, h) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionsWorld(x, y, w, h), gl.STATIC_DRAW)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  function drawRect(x, y, width, height, color) {
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, y, width, height);
    gl.clearColor(...color, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST)
  }

  function refreshViewPortSize() {
    const width = window.innerWidth
    const height = window.innerHeight
    console.log('resize', width, height)
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
  }

  requestAnimationFrame(function animationFrame() {
    gl.clearColor(.5, .5, .5, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let x = 0; x < game.width; x++)
      for (let y = 0; y < game.height; y++)
        drawRect(
          x * zoom,
          y * zoom,
          zoom,
          zoom,
          game.getValue(x, y) ? [Math.random(), Math.random(), Math.random()] : [0, 0, 0],
        )


    window.requestAnimationFrame(animationFrame)
  })

  addEventListener('resize', () => {
    refreshViewPortSize()
  })

  document.addEventListener('mousedown', event => {
    const x = Math.floor(event.x / zoom)
    const y = Math.floor((canvas.height - event.y) / zoom)
    game.toggleValue(x, y)
  })

  setInterval(() => {
    if (!paused)
      game.nextStep()
  }, 200)

  document.addEventListener('keydown', event => {
    console.log('keydown', event.code)
    if (event.code === 'Space')
      paused = !paused
  })

  refreshViewPortSize()

})

