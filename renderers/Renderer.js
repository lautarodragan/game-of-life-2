import { WorldRenderer } from './WorldRenderer.js'
import { HeadsUpDisplayRenderer } from './HeadsUpDisplayRenderer.js'

export const Renderer = async (canvas, game, camera) => {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not available in this browser.')
  }

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    throw new Error('No WebGPU adapter found.')
  }
  const device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  const format = navigator.gpu.getPreferredCanvasFormat()

  context.configure({
    device,
    format,
    alphaMode: 'opaque',
  })

  const worldRenderer = WorldRenderer(device, format, game, camera)
  const headsUpDisplayRenderer = HeadsUpDisplayRenderer(device, format)

  function render() {
    const encoder = device.createCommandEncoder()
    const view = context.getCurrentTexture().createView()
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    })

    worldRenderer.render(pass)
    headsUpDisplayRenderer.render(pass)

    pass.end()
    device.queue.submit([encoder.finish()])
  }

  function setViewPortSize(width, height) {
    canvas.width = width
    canvas.height = height
    worldRenderer.setResolution(width, height)
    headsUpDisplayRenderer.setResolution(width, height)
  }

  function loadTextures(url) {
    headsUpDisplayRenderer.loadFontTexture(url)
  }

  return {
    render,
    setViewPortSize,
    setFPS: headsUpDisplayRenderer.setFPS,
    setSpeed: headsUpDisplayRenderer.setSpeed,
    setDecay: headsUpDisplayRenderer.setDecay,
    setTextZoom: headsUpDisplayRenderer.setTextZoom,
    get textZoom() { return headsUpDisplayRenderer.textZoom },
    set textZoom(_) { headsUpDisplayRenderer.textZoom = _ },
    loadTextures,
  }
}
