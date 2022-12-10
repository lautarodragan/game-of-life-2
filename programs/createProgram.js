import { fragmentShaderSource, vertexShaderSource } from '../shaders/game.js'

function createShader(gl, shaderType, source) {
  const shader = gl.createShader(shaderType)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Unable to compile shader')
    console.error(gl.getShaderInfoLog(shader))
    console.error(source)
    throw new Error('Unable to compile Shader')
  }

  return shader
}

export function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log('Unable to link program')
    console.log(gl.getProgramInfoLog(program))
    throw new Error('Unable to link program')
  }

  gl.useProgram(program)

  return program
}
