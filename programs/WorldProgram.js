import { createProgram } from './createProgram.js'
import { fragmentShaderSource, vertexShaderSource } from '../shaders/game.js'

export const WorldProgram = (gl) => {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const uResolution = gl.getUniformLocation(program, 'uResolution')
  
  const positionBuffer = gl.createBuffer()
  const colorBuffer = gl.createBuffer()

  const positionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(positionAttribute)

  const colorAttribute = gl.getAttribLocation(program, 'vColor');
  gl.enableVertexAttribArray(colorAttribute);
  
  function use() {
    gl.useProgram(program)
  }
  
  function render(count) {
    gl.drawArrays(gl.TRIANGLES, 0, count)
  }
  
  function setResolution(width, height) {
    const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM)
    gl.useProgram(program)
    gl.uniform2f(uResolution, width, height)
    gl.useProgram(previousProgram)
  }

  function setPositions(positions) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)
  }

  function setColors(colors) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
    gl.vertexAttribPointer(colorAttribute, 2, gl.FLOAT, false, 0, 0)
  }

  return {
    use,
    render,
    setResolution,
    setPositions,
    setColors,
  }
}
