import { GameOfLife } from './GameOfLife.js'
import { Interval } from './Interval.js'
import { Renderer } from './Renderer.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  const gl = canvas.getContext('webgl2',  { alpha: false })

  const game = new GameOfLife(600, 600)
  let pencil = 1
  const camera = {
    x: 0,
    y: 0,
    z: 40,
  }

  let performanceSampleCount = 0
  let performanceAverage = 0
  const gameInterval = new Interval(() => {
    const start = performance.now()

    game.nextStep()

    performanceSampleCount++
    const measure = performance.now() - start

    if (performanceSampleCount > 1)
      performanceAverage = performanceAverage * (performanceSampleCount - 1) / performanceSampleCount + measure / performanceSampleCount
    else
      performanceAverage = measure

    if (performanceSampleCount % 10 === 0)
      document.title = `Avg: ${Math.round(performanceAverage)}`
    // console.log(`This run: ${Math.round(measure)}`, `Avg: ${Math.round(performanceAverage)}`)
  }, 200)

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
    x: Math.floor((event.x - camera.x) / camera.z),
    y: Math.floor((canvas.height - event.y - camera.y) / camera.z),
  })

  requestAnimationFrame(function animationFrame() {
    renderer.render(camera)
    window.requestAnimationFrame(animationFrame)
  })

  addEventListener('resize', () => {
    refreshViewPortSize()
  })

  refreshViewPortSize()

  document.addEventListener('mousedown', event => {
    if (event.buttons === 1) {
      const {x, y} = mouseEventToBoardCoords(event)

      if (!game.isInBounds(x, y))
        return

      game.toggleValue(x, y)
      pencil = game.getValue(x, y)
    }
  })

  document.addEventListener('mousemove', event => {
    if (event.buttons === 1) {
      const { x, y } = mouseEventToBoardCoords(event)

      if (!game.isInBounds(x, y))
        return

      game.setValue(x, y, pencil)
    }
    if (event.buttons === 2) {
      event.preventDefault()
      camera.x += event.movementX
      camera.y -= event.movementY
    }
  })

  document.addEventListener('contextmenu', event => {
    event.preventDefault()
  })

  document.addEventListener('keydown', event => {
    // console.log('keydown', event.code)
    if (event.code === 'Space') {
      event.preventDefault()
      gameInterval.toggle()
    } else if (event.code === 'ArrowRight') {
      event.preventDefault()
      gameInterval.intervalTime -= 20
      console.log('speed', gameInterval.intervalTime)
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault()
      gameInterval.intervalTime += 20
      console.log('speed', gameInterval.intervalTime)
    }
  })

  document.addEventListener('wheel', event => {
    const newZoom = camera.z - Math.sign(event.deltaY)

    if (newZoom > 1)
      camera.z = newZoom
  })

})

