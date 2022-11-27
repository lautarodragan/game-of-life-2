import { GameOfLife } from './GameOfLife.js'
import { Interval } from './Interval.js'
import { Renderer } from './Renderer.js'
import { withPerformance } from './withPerformance.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  const gl = canvas.getContext('webgl2',  { alpha: false })

  const game = GameOfLife(100, 100)
  let pencil = 1
  const camera = {
    x: 0,
    y: 0,
    z: 40,
    w: 1,
    h: 1,
  }
  window.camera = camera

  const onPerformance = (averageMeasure) => {
    // document.title = `Avg: ${Math.round(averageMeasure)}`
  }

  const gameInterval = new Interval(
    withPerformance(game.nextStep, 10, onPerformance),
    200,
  )

  const renderer = Renderer(game, gl)

  function refreshViewPortSize() {
    const width = window.innerWidth
    const height = window.innerHeight
    console.log('resize', width, height)
    canvas.width = width
    canvas.height = height
    renderer.setViewPortSize(width, height)
    camera.w = width
    camera.h = height
    // camera.x = game.width / 2 * camera.z
    // camera.y = game.height / 2 * camera.z
  }

  const mouseEventToBoardCoords = (event) => ({
    x: Math.floor((event.x + camera.x - camera.w / 2) / camera.z + game.width / 2),
    y: Math.floor((canvas.height - event.y + camera.y - camera.h / 2) / camera.z + game.height / 2),
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
      camera.x -= event.movementX
      camera.y += event.movementY
      debugCamera()
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
    } else if (event.code === 'ArrowUp') {
      event.preventDefault()
      game.decay += 8
      console.log('decay', game.decay)
    } else if (event.code === 'ArrowDown') {
      event.preventDefault()
      game.decay -= 8
      console.log('decay', game.decay)
    } else if (event.code === 'KeyR' && !event.ctrlKey) {
      event.preventDefault()
      game.clear()
    }
  })

  document.addEventListener('wheel', event => {
    const sign = Math.sign(event.deltaY)
    const newZoom = camera.z - sign

    if (newZoom >= 1) {
      debugCamera()
      camera.z = newZoom
    }
  })

  const debugCamera = () => {
    document.title = `${Math.round(camera.x)}x, ${Math.round(camera.y)}y, ${Math.round(camera.z)}z, ${Math.round(camera.w)}w, ${Math.round(camera.h)}h`
  }

})

