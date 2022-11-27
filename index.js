import { createProgram } from './createProgram.js'
import { GameOfLife } from './GameOfLife.js'
import { Interval } from './Interval.js'
import { Renderer } from './Renderer.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  const gl = canvas.getContext('webgl2',  { alpha: false })

  const program = createProgram(gl)
  const game = new GameOfLife(20, 20)
  let zoom = 40
  let pencil = 1

  const gameInterval = new Interval(() => {
    game.nextStep()
  })

  const renderer = Renderer(game, gl)

  function refreshViewPortSize() {
    const width = window.innerWidth
    const height = window.innerHeight
    console.log('resize', width, height)
    canvas.width = width
    canvas.height = height
    renderer.setViewPortSize(width, height)
  }

  const mouseEventToBoardCoords = (event) => ({
    x: Math.floor(event.x / zoom),
    y: Math.floor((canvas.height - event.y) / zoom),
  })

  requestAnimationFrame(function animationFrame() {
    renderer.render(zoom)
    window.requestAnimationFrame(animationFrame)
  })

  addEventListener('resize', () => {
    refreshViewPortSize()
  })

  document.addEventListener('mousedown', event => {
    const { x, y } = mouseEventToBoardCoords(event)

    if (!game.isInBounds(x, y))
      return

    game.toggleValue(x, y)
    pencil = game.getValue(x, y)
  })

  document.addEventListener('mousemove', event => {
    if (event.buttons) {
      const { x, y } = mouseEventToBoardCoords(event)

      if (!game.isInBounds(x, y))
        return

      game.setValue(x, y, pencil)
    }
  })

  document.addEventListener('keydown', event => {
    console.log('keydown', event.code)
    if (event.code === 'Space')
      gameInterval.toggle()
  })

  document.addEventListener('wheel', event => {
    const newZoom = zoom - Math.sign(event.deltaY)

    if (newZoom > 10)
      zoom = newZoom
  })

  refreshViewPortSize()

})

