import { shaderSource } from '../shaders/step.js'

export const StepProgram = (device, width, height, stateA, stateB) => {
  const module = device.createShaderModule({ label: 'step', code: shaderSource })

  // uniforms: vec2u gridSize, u32 decay, u32 step → 16 bytes (already aligned).
  const uniformBuffer = device.createBuffer({
    label: 'step-uniforms',
    size: 16,
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
    makeBindGroup(stateA, stateB), // current = A → write to B
    makeBindGroup(stateB, stateA), // current = B → write to A
  ]

  const uniformScratch = new Uint32Array(4)

  function dispatch(currentIdx, decay, step) {
    uniformScratch[0] = width
    uniformScratch[1] = height
    uniformScratch[2] = decay
    uniformScratch[3] = step
    device.queue.writeBuffer(uniformBuffer, 0, uniformScratch.buffer, 0, 16)

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
