import { StepProgram } from './programs/StepProgram.js'

// Each cell is a vec4<u32> in GPU memory: (life, r, g, b).
//   life:    0..255 (255 = fully alive, 0 = dead, in-between = decaying)
//   r,g,b:   color frozen at the moment the cell started decaying.
// 16 bytes per cell.
const BYTES_PER_CELL = 16

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
    const zeros = new Uint32Array(cellCount * 4)
    device.queue.writeBuffer(stateBuffers[0], 0, zeros.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, zeros.buffer, 0, bufferSize)
  }

  const step = StepProgram(device, width, height, stateBuffers[0], stateBuffers[1])

  let _decay = 0x1f
  let currentIdx = 0
  const shadow = new Uint8Array(cellCount)

  // Latest per-frame color (set by the renderer). Snapshotted into the step
  // uniform whenever nextStep dispatches.
  const currentColor255 = new Uint32Array(3)

  const cellScratch = new Uint32Array(4)

  function writeCell(bufIdx, x, y, life) {
    cellScratch[0] = life
    cellScratch[1] = 0
    cellScratch[2] = 0
    cellScratch[3] = 0
    const offset = (x + y * width) * BYTES_PER_CELL
    device.queue.writeBuffer(stateBuffers[bufIdx], offset, cellScratch.buffer, 0, BYTES_PER_CELL)
  }

  function setValue(x, y, value) {
    if (!isInBounds(x, y)) throw new Error(`Not in bounds: ${x}, ${y}`)
    writeCell(0, x, y, value)
    writeCell(1, x, y, value)
    shadow[x + y * width] = value
  }

  function toggleValue(x, y) {
    setValue(x, y, shadow[x + y * width] ? 0 : 0xff)
  }

  function getValue(x, y) {
    return shadow[x + y * width]
  }

  function isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < width && y < height
  }

  function clear() {
    const zeros = new Uint32Array(cellCount * 4)
    device.queue.writeBuffer(stateBuffers[0], 0, zeros.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, zeros.buffer, 0, bufferSize)
    shadow.fill(0)
  }

  function random() {
    const data = new Uint32Array(cellCount * 4)
    for (let i = 0; i < cellCount; i++) {
      const alive = Math.random() > 0.75 ? 0xff : 0
      data[i * 4 + 0] = alive
      shadow[i] = alive
    }
    device.queue.writeBuffer(stateBuffers[0], 0, data.buffer, 0, bufferSize)
    device.queue.writeBuffer(stateBuffers[1], 0, data.buffer, 0, bufferSize)
  }

  function setCurrentColor(rgb01) {
    currentColor255[0] = Math.round(rgb01[0] * 255)
    currentColor255[1] = Math.round(rgb01[1] * 255)
    currentColor255[2] = Math.round(rgb01[2] * 255)
  }

  function nextStep() {
    step.dispatch(currentIdx, _decay, currentColor255)
    currentIdx = 1 - currentIdx
  }

  return {
    get width() { return width },
    get height() { return height },
    get decay() { return _decay },
    set decay(v) { _decay = Math.min(Math.max(v, 0), 0xff) },
    getStateBuffer() { return stateBuffers[currentIdx] },
    getStateBuffers() { return stateBuffers },
    getCurrentIndex() { return currentIdx },
    setCurrentColor,
    isInBounds,
    getValue,
    setValue,
    toggleValue,
    nextStep,
    clear,
    random,
  }
}
