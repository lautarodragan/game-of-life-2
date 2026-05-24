import { shaderSource } from '../shaders/game.js'
import { uploadVertexBuffer } from './createProgram.js'

export const WorldProgram = (device, format) => {
  const module = device.createShaderModule({ label: 'world', code: shaderSource })

  const uniformBuffer = device.createBuffer({
    label: 'world-uniforms',
    size: 16, // vec2f padded to 16
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
    ],
  })

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  })

  const pipeline = device.createRenderPipeline({
    label: 'world',
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: {
      module,
      entryPoint: 'vs_main',
      buffers: [
        {
          arrayStride: 2 * 4,
          attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
        },
        {
          arrayStride: 3 * 4,
          attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }],
        },
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
  let colorBuffer = null
  const resolution = new Float32Array(4) // padded to vec4

  function setResolution(width, height) {
    resolution[0] = width
    resolution[1] = height
    device.queue.writeBuffer(uniformBuffer, 0, resolution.buffer, resolution.byteOffset, 16)
  }

  function setPositions(positions) {
    positionBuffer = uploadVertexBuffer(device, positionBuffer, positions, 'world-positions')
  }

  function setColors(colors) {
    colorBuffer = uploadVertexBuffer(device, colorBuffer, colors, 'world-colors')
  }

  function render(pass, count) {
    if (count === 0 || !positionBuffer || !colorBuffer) return
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.setVertexBuffer(0, positionBuffer)
    pass.setVertexBuffer(1, colorBuffer)
    pass.draw(count, 1, 0, 0)
  }

  return {
    render,
    setResolution,
    setPositions,
    setColors,
  }
}
