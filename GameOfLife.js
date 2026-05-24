import { StepProgram } from './programs/StepProgram.js'

// Each cell is a vec2<u32> in GPU memory: (life, birthStep). 8 bytes per cell.
const BYTES_PER_CELL = 8

export const GameOfLife = (device, width, height) => {
  const cellCount = width * height
  const bufferSize = cellCount * BYTES_PER_CELL

  const stateBuffers = [
    device.createBuffer({
      label: 'gol-state-a',
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    }),
    device.createBuffer({
      label: 'gol-state-b',
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    }),
  ]

  // Zero both state buffers — newly created storage buffers have undefined contents.
  {
    const zeros = new Uint32Array(cellCount * 2)
    device.queue.writeBuffer(stateBuffers[0], 0, zeros.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, zeros.buffer, 0, bufferSize)
  }

  const step = StepProgram(device, width, height, stateBuffers[0], stateBuffers[1])

  let _decay = 0x1f
  let currentIdx = 0       // index of the buffer the renderer reads from
  let stepCounter = 0      // increments each nextStep — used as birthStep value
  const shadow = new Uint8Array(cellCount) // CPU shadow of cell `life`, best-effort

  // Scratch used to upload a single cell's vec2u via writeBuffer.
  const cellScratch = new Uint32Array(2)

  function writeCell(bufIdx, x, y, life, birth) {
    cellScratch[0] = life
    cellScratch[1] = birth
    const offset = (x + y * width) * BYTES_PER_CELL
    device.queue.writeBuffer(stateBuffers[bufIdx], offset, cellScratch.buffer, 0, BYTES_PER_CELL)
  }

  function setValue(x, y, value) {
    if (!isInBounds(x, y)) throw new Error(`Not in bounds: ${x}, ${y}`)
    // Write to both ping-pong buffers so paint isn't lost on the next step's flip.
    writeCell(0, x, y, value, stepCounter)
    writeCell(1, x, y, value, stepCounter)
    shadow[x + y * width] = value
  }

  function toggleValue(x, y) {
    const current = shadow[x + y * width]
    setValue(x, y, current ? 0 : 0xff)
  }

  function getValue(x, y) {
    return shadow[x + y * width]
  }

  function isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < width && y < height
  }

  function clear() {
    const zeros = new Uint32Array(cellCount * 2)
    device.queue.writeBuffer(stateBuffers[0], 0, zeros.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, zeros.buffer, 0, bufferSize)
    shadow.fill(0)
  }

  function random() {
    const data = new Uint32Array(cellCount * 2)
    for (let i = 0; i < cellCount; i++) {
      const alive = Math.random() > 0.75 ? 0xff : 0
      data[i * 2 + 0] = alive
      data[i * 2 + 1] = stepCounter
      shadow[i] = alive
    }
    device.queue.writeBuffer(stateBuffers[0], 0, data.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, data.buffer, 0, bufferSize)
  }

  function nextStep() {
    stepCounter++
    step.dispatch(currentIdx, _decay, stepCounter)
    currentIdx = 1 - currentIdx
    // Shadow is now stale w.r.t. cells touched by simulation. We leave it alone:
    // user-painted cells stay accurate; sim-driven changes are not reflected.
  }

  return {
    get width() { return width },
    get height() { return height },
    get decay() { return _decay },
    set decay(v) { _decay = Math.min(Math.max(v, 0), 0xff) },
    getStateBuffer() { return stateBuffers[currentIdx] },
    getStateBuffers() { return stateBuffers },
    getCurrentIndex() { return currentIdx },
    isInBounds,
    getValue,
    setValue,
    toggleValue,
    nextStep,
    clear,
    random,
  }
}
