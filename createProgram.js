import { fragmentShaderSource, vertexShaderSource } from './shaders/game.js'

function createVertexShader(gl) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.compileShader(vertexShader)

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log('Unable to compile VertexShader')
    console.log(gl.getShaderInfoLog(vertexShader))
    throw new Error('Unable to compile VertexShader')
  }

  return vertexShader
}

function createFragmentShader(gl) {
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fragmentShader, fragmentShaderSource)
  gl.compileShader(fragmentShader)

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log('Unable to compile FragmentShader')
    console.log(gl.getShaderInfoLog(fragmentShader))
    throw new Error('Unable to compile VertexShader')
  }

  return fragmentShader
}

export function createProgram(gl) {
  const vertexShader = createVertexShader(gl)
  const fragmentShader = createFragmentShader(gl)

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
