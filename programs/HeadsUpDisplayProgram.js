import { shaderSource } from '../shaders/hud.js'
import { uploadVertexBuffer } from './createProgram.js'
import { loadImage } from '../purish/loadImage.js'

export const HeadsUpDisplayProgram = (device, format) => {
  const module = device.createShaderModule({ label: 'hud', code: shaderSource })

  const uniformBuffer = device.createBuffer({
    label: 'hud-uniforms',
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
  })

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'filtering' } },
      { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: { viewDimension: '2d-array', sampleType: 'float' } },
    ],
  })

  const pipeline = device.createRenderPipeline({
    label: 'hud',
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: {
      module,
      entryPoint: 'vs_main',
      buffers: [
        { arrayStride: 2 * 4, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }] },
        { arrayStride: 2 * 4, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x2' }] },
        { arrayStride: 4,     attributes: [{ shaderLocation: 2, offset: 0, format: 'uint32'    }] },
      ],
    },
    fragment: {
      module,
      entryPoint: 'fs_main',
      targets: [{
        format,
        blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        },
      }],
    },
    primitive: { topology: 'triangle-list' },
  })

  let positionBuffer = null
  let textureCoordBuffer = null
  let layerBuffer = null
  let fontTexture = null
  let bindGroup = null
  const resolution = new Float32Array(4)

  function setResolution(width, height) {
    resolution[0] = width
    resolution[1] = height
    device.queue.writeBuffer(uniformBuffer, 0, resolution.buffer, resolution.byteOffset, 16)
  }

  function setPositions(positions) {
    positionBuffer = uploadVertexBuffer(device, positionBuffer, positions, 'hud-positions')
  }

  function setTextureCoords(coords) {
    textureCoordBuffer = uploadVertexBuffer(device, textureCoordBuffer, coords, 'hud-tex-coords')
  }

  function setLayers(layersU8) {
    // The vertex format `uint32` needs one u32 per vertex.
    const layers = new Uint32Array(layersU8.length)
    for (let i = 0; i < layersU8.length; i++) layers[i] = layersU8[i]
    layerBuffer = uploadVertexBuffer(device, layerBuffer, layers, 'hud-layers')
  }

  function loadFontTexture(url) {
    loadImage(url, image => {
      fontImageToTexture(image)
    })
  }

  function fontImageToTexture(image) {
    const tileSize = 8
    const tileCount = image.height / tileSize

    fontTexture = device.createTexture({
      label: 'hud-font',
      size: { width: tileSize, height: tileSize, depthOrArrayLayers: tileCount },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    })

    for (let i = 0; i < tileCount; i++) {
      device.queue.copyExternalImageToTexture(
        { source: image, origin: { x: 0, y: i * tileSize } },
        { texture: fontTexture, origin: { x: 0, y: 0, z: i } },
        { width: tileSize, height: tileSize, depthOrArrayLayers: 1 },
      )
    }

    bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: sampler },
        { binding: 2, resource: fontTexture.createView({ dimension: '2d-array' }) },
      ],
    })
  }

  function render(pass, count) {
    if (count === 0 || !bindGroup || !positionBuffer || !textureCoordBuffer || !layerBuffer) return
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.setVertexBuffer(0, positionBuffer)
    pass.setVertexBuffer(1, textureCoordBuffer)
    pass.setVertexBuffer(2, layerBuffer)
    pass.draw(count, 1, 0, 0)
  }

  function areTexturesLoaded() {
    return bindGroup !== null
  }

  return {
    render,
    setResolution,
    setPositions,
    setTextureCoords,
    setLayers,
    loadFontTexture,
    areTexturesLoaded,
  }
}
