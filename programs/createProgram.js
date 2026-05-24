export function createShaderModule(device, code, label) {
  return device.createShaderModule({ label, code })
}

// Helper that grows a GPU buffer to fit `byteLength` and uploads `data`.
// Returns the (possibly new) buffer. Pass the previous buffer (or null) as `prev`.
export function uploadVertexBuffer(device, prev, data, label) {
  const byteLength = Math.max(data.byteLength, 4)
  let buffer = prev
  if (!buffer || buffer.size < byteLength) {
    if (buffer) buffer.destroy()
    buffer = device.createBuffer({
      label,
      size: byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    })
  }
  if (data.byteLength > 0) {
    device.queue.writeBuffer(buffer, 0, data.buffer, data.byteOffset, data.byteLength)
  }
  return buffer
}
