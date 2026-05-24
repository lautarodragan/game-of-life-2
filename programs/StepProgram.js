import { shaderSource } from '../shaders/step.js'

// StepUniforms layout (32 bytes):
//   vec2u gridSize @ 0
//   u32   decay    @ 8
//   u32   _pad     @ 12
//   vec4u color    @ 16
const STEP_UNIFORM_SIZE = 32

export const StepProgram = (device, width, height, stateA, stateB) => {
  const module = device.createShaderModule({ label: 'step', code: shaderSource })

  const uniformBuffer = device.createBuffer({
    label: 'step-uniforms',
    size: STEP_UNIFORM_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  })

  const pipeline = device.createComputePipeline({
    label: 'step',
    layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
    compute: { module, entryPoint: 'step_main' },
  })

  const makeBindGroup = (readBuf, writeBuf) => device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: { buffer: readBuf } },
      { binding: 2, resource: { buffer: writeBuf } },
    ],
  })

  const bindGroups = [
    makeBindGroup(stateA, stateB),
    makeBindGroup(stateB, stateA),
  ]

  const uniformScratch = new Uint32Array(STEP_UNIFORM_SIZE / 4)

  function dispatch(currentIdx, decay, colorRGB255) {
    uniformScratch[0] = width
    uniformScratch[1] = height
    uniformScratch[2] = decay
    uniformScratch[3] = 0
    uniformScratch[4] = colorRGB255[0]
    uniformScratch[5] = colorRGB255[1]
    uniformScratch[6] = colorRGB255[2]
    uniformScratch[7] = 0
    device.queue.writeBuffer(uniformBuffer, 0, uniformScratch.buffer, 0, STEP_UNIFORM_SIZE)

    const encoder = device.createCommandEncoder({ label: 'step' })
    const pass = encoder.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bindGroups[currentIdx])
    pass.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8))
    pass.end()
    device.queue.submit([encoder.finish()])
  }

  return { dispatch }
}
