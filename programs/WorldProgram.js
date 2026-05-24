import { shaderSource } from '../shaders/game.js'

// Camera uniform layout (48 bytes):
//   vec2f pos       @ 0
//   vec2f size      @ 8
//   f32   zoom      @ 16
//   f32   _pad0     @ 20
//   vec2f gridSize  @ 24
//   vec2f _pad1     @ 32
//   vec4f color     @ 32 + 8 = 40  -> needs 16-byte align -> 48
// Round to 64 to keep alignment safe.
const CAMERA_UNIFORM_SIZE = 64

export const WorldProgram = (device, format, stateBuffers) => {
  const module = device.createShaderModule({ label: 'world', code: shaderSource })

  const uniformBuffer = device.createBuffer({
    label: 'world-camera',
    size: CAMERA_UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
    ],
  })

  const pipeline = device.createRenderPipeline({
    label: 'world',
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    vertex: { module, entryPoint: 'vs_main' },
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

  const bindGroups = stateBuffers.map((buf, i) => device.createBindGroup({
    label: `world-bg-${i}`,
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: buf } },
    ],
  }))

  const scratch = new ArrayBuffer(CAMERA_UNIFORM_SIZE)
  const scratchF = new Float32Array(scratch)

  function setCamera(camera, gridWidth, gridHeight, colorRGB01) {
    scratchF[0] = camera.x
    scratchF[1] = camera.y
    scratchF[2] = camera.w
    scratchF[3] = camera.h
    scratchF[4] = camera.z
    scratchF[5] = 0
    scratchF[6] = gridWidth
    scratchF[7] = gridHeight
    // _pad1 at floats [8], [9] — leave zero
    // color at floats [12..15] (byte offset 48): vec4 starts at offset 48 for 16-byte alignment
    scratchF[12] = colorRGB01[0]
    scratchF[13] = colorRGB01[1]
    scratchF[14] = colorRGB01[2]
    scratchF[15] = 1
    device.queue.writeBuffer(uniformBuffer, 0, scratch, 0, CAMERA_UNIFORM_SIZE)
  }

  function render(pass, currentIdx, instanceCount) {
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroups[currentIdx])
    pass.draw(6, instanceCount, 0, 0)
  }

  return {
    setCamera,
    render,
  }
}
