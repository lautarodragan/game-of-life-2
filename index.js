import { GameOfLife } from './GameOfLife.js'
import { Interval } from './Interval.js'
import { Renderer } from './renderers/Renderer.js'

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  const gl = canvas.getContext('webgl2',  {
    alpha: false,
    preserveDrawingBuffer : false,
    antialias: false,
  })
  window.gl = gl

  const game = GameOfLife(300, 300)
  let pencil = 1
  const camera = {
    x: 0,
    y: 0,
    z: 40,
    w: 1,
    h: 1,
  }

  const gameInterval = new Interval(game.nextStep, 200)

  const renderer = Renderer(gl, game, camera)
  renderer.setSpeed(200)

  function refreshViewPortSize() {
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width
    canvas.height = height
    renderer.setViewPortSize(width, height)
    camera.w = width
    camera.h = height
    // TODO: adjust camera.x, camera.y so zoom is centered on the pointer
  }
  
  function loadTextures() {
    renderer.loadTextures('/images/bubblemad_8x8_v.png')
  }
  
  const mouseEventToBoardCoords = (event) => ({
    x: Math.floor((event.x + camera.x - camera.w / 2) / camera.z + game.width / 2),
    y: Math.floor((canvas.height - event.y + camera.y - camera.h / 2) / camera.z + game.height / 2),
  })

  let frameCount = 0
  let lastFrameStartTime = performance.now()
  const fpsMeasurements = new Float32Array(60)

  const calculateAverageFPS = () => {
    let fps = 0

    for (let i = 0; i < fpsMeasurements.length; i++)
      fps += fpsMeasurements[i] / fpsMeasurements.length

    return fps
  }
  
  const updateFPS = () => {
    const timelapse = performance.now() - lastFrameStartTime
    lastFrameStartTime = performance.now()
  
    fpsMeasurements[frameCount % fpsMeasurements.length] = 1 / timelapse * 1000
    renderer.setFPS(calculateAverageFPS())
  
    frameCount++
  }
  
  requestAnimationFrame(function animationFrame() {
    renderer.render()
    updateFPS()
    requestAnimationFrame(animationFrame)
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
      
      if (gameInterval.intervalTime > 0) {
        gameInterval.intervalTime = Math.max(gameInterval.intervalTime - 20, 0)
        renderer.setSpeed(gameInterval.intervalTime)
      }
      
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault()
      
      const maxSpeed = 1000
      
      if (gameInterval.intervalTime < maxSpeed) {
        gameInterval.intervalTime = Math.min(gameInterval.intervalTime + 20, maxSpeed)
        renderer.setSpeed(gameInterval.intervalTime)
      }
      
    } else if (event.code === 'ArrowUp') {
      event.preventDefault()
      game.decay += 8
      renderer.setDecay(game.decay)
    } else if (event.code === 'ArrowDown') {
      event.preventDefault()
      game.decay -= 8
      renderer.setDecay(game.decay)
    } else if (event.code === 'KeyR' && !event.ctrlKey) {
      event.preventDefault()
      game.clear()
    } else if (event.code === 'KeyF' && !event.ctrlKey) {
      event.preventDefault()
      game.random()
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
  
  loadTextures()
  
})

