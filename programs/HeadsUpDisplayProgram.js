import { createProgram } from './createProgram.js'
import { fragmentShaderSource, vertexShaderSource } from '../shaders/hud.js'

export const HeadsUpDisplayProgram = (gl) => {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const uResolution = gl.getUniformLocation(program, 'uResolution')

  const positionBuffer = gl.createBuffer()

  const positionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(positionAttribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)

  function render(count) {
    gl.drawArrays(gl.TRIANGLES, 0, count)
  }

  function setResolution(width, height) {
    gl.uniform2f(uResolution, width, height)
  }

  function setPositions(positions) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  }

  return {
    render,
    setResolution,
    setPositions,
  }
}
