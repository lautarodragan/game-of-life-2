import { GameOfLife } from './GameOfLife.js'
import { Interval } from './Interval.js'
import { Patterns } from './Patterns.js'
import { Renderer, initWebGPU } from './renderers/Renderer.js'

document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementsByTagName('canvas')[0]

  const { device, context, format } = await initWebGPU(canvas)

  const game = GameOfLife(device, 800, 600)
  let pencil = 1
  const camera = {
    x: 0,
    y: 0,
    z: 40,
    w: 1,
    h: 1,
  }

  const gameInterval = new Interval(game.nextStep, 20)

  const renderer = Renderer(device, context, format, canvas, game, camera)
  renderer.setSpeed(gameInterval.intervalTime)

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

  const lastMouse = { x: 0, y: 0 }
  document.addEventListener('mousemove', event => {
    lastMouse.x = event.x
    lastMouse.y = event.y
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
        gameInterval.intervalTime = Math.max(gameInterval.intervalTime - 5, 0)
        renderer.setSpeed(gameInterval.intervalTime)
      }
      
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault()
      
      const maxSpeed = 1000
      
      if (gameInterval.intervalTime < maxSpeed) {
        gameInterval.intervalTime = Math.min(gameInterval.intervalTime + 5, maxSpeed)
        renderer.setSpeed(gameInterval.intervalTime)
      }
      
    } else if (event.code === 'ArrowUp') {
      event.preventDefault()
      game.decay += 2
      renderer.setDecay(game.decay)
    } else if (event.code === 'ArrowDown') {
      event.preventDefault()
      game.decay -= 2
      renderer.setDecay(game.decay)
    } else if (event.code === 'KeyR' && !event.ctrlKey) {
      event.preventDefault()
      game.clear()
    } else if (event.code === 'KeyF' && !event.ctrlKey) {
      event.preventDefault()
      game.random()
    } else if (event.code === 'Equal') {
      event.preventDefault()
      renderer.textZoom += .25
    } else if (event.code === 'Minus') {
      event.preventDefault()
      renderer.textZoom -= .25
    } else if (event.code === 'KeyH' && !event.ctrlKey) {
      event.preventDefault()
      renderer.toggleHud()
    } else if (event.code === 'KeyS' && !event.ctrlKey) {
      event.preventDefault()
      renderer.cycleCellShape()
    } else if (event.code === 'Digit1') {
      event.preventDefault()
      pastePatternAtCursor(Patterns.glider)
    } else if (event.code === 'Digit2') {
      event.preventDefault()
      pastePatternAtCursor(Patterns.lightweightSpaceship)
    } else if (event.code === 'Digit3') {
      event.preventDefault()
      pastePatternAtCursor(Patterns.biClock)
    }
  })

  document.addEventListener('wheel', event => {
    const sign = Math.sign(event.deltaY)
    const newZoom = camera.z - sign

    if (newZoom < 1) return

    // Keep the world point under the cursor stationary across the zoom change.
    // Derived from the inverse of mouseEventToBoardCoords (see camera math above).
    const ey = canvas.height - event.y
    const dx = (event.x - camera.w / 2 + camera.x) / camera.z
    const dy = (ey - camera.h / 2 + camera.y) / camera.z

    camera.x += dx * (newZoom - camera.z)
    camera.y += dy * (newZoom - camera.z)
    camera.z = newZoom

    debugCamera()
  })

  const pastePatternAtCursor = (pattern) => {
    const { x, y } = mouseEventToBoardCoords(lastMouse)
    const cols = pattern[0].length
    const rows = pattern.length
    game.pastePattern(pattern, x - Math.floor(cols / 2), y - Math.floor(rows / 2))
  }

  const debugCamera = () => {
    document.title = `${Math.round(camera.x)}x, ${Math.round(camera.y)}y, ${Math.round(camera.z)}z, ${Math.round(camera.w)}w, ${Math.round(camera.h)}h`
  }
  
  loadTextures()
  
})

