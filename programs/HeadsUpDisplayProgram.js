import { createProgram } from './createProgram.js'
import { fragmentShaderSource, vertexShaderSource } from '../shaders/hud.js'

export const HeadsUpDisplayProgram = (gl) => {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const uResolution = gl.getUniformLocation(program, 'uResolution')

  const positionBuffer = gl.createBuffer()
  const textureCoordBuffer = gl.createBuffer()
  const fontTexture = gl.createTexture()

  const position = gl.getAttribLocation(program, 'aVertexPosition')
  console.log('HUD positionAttribute', position)
  gl.enableVertexAttribArray(position)
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0)
  
  const textureCoord = gl.getAttribLocation(program, 'aTextureCoord')
  gl.enableVertexAttribArray(textureCoord)
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  // gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0)
  
  gl.bindTexture(gl.TEXTURE_2D, fontTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.bindTexture(gl.TEXTURE_2D, null)
  
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
  }
  
  function loadFontTexture(url) {
    console.log('loading image', url)
    const image = new Image()
    image.onload = () => {
      console.log('image loaded', url)
      const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM)
      gl.useProgram(program)
      fontImageToTexture(image)
      gl.useProgram(previousProgram)
    }
    image.src = url
  }
  
  function fontImageToTexture(image) {
    gl.bindTexture(gl.TEXTURE_2D, fontTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  return {
    use: () => { gl.useProgram(program) },
    render,
    setResolution,
    setPositions,
    loadFontTexture,
  }
}
