import { createProgram } from './createProgram.js'
import { fragmentShaderSource, vertexShaderSource } from '../shaders/hud.js'
import { loadImage } from '../purish/loadImage.js'

export const HeadsUpDisplayProgram = (gl) => {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const uResolution = gl.getUniformLocation(program, 'uResolution')
  const uSampler = gl.getUniformLocation(program, 'uSampler')

  const positionBuffer = gl.createBuffer()
  const textureCoordBuffer = gl.createBuffer()
  const fontTexture = gl.createTexture()
  
  let isFontTextureLoaded = false
  
  gl.uniform1i(uSampler, 0)

  const position = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(position)
  
  const textureCoord = gl.getAttribLocation(program, 'aTextureCoord')
  gl.enableVertexAttribArray(textureCoord)
  
  gl.bindTexture(gl.TEXTURE_2D, fontTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.bindTexture(gl.TEXTURE_2D, null)
  
  function use() {
    gl.bindTexture(gl.TEXTURE_2D, fontTexture)
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
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  }
  
  function setTextureCoords(textureCoords) {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, textureCoords, gl.STATIC_DRAW)
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0)
  }
  
  function loadFontTexture(url) {
    loadImage(url, image => {
      const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM)
      gl.useProgram(program)
      fontImageToTexture(image)
      gl.useProgram(previousProgram)
      isFontTextureLoaded = true
    })
  }
  
  function fontImageToTexture(image) {
    gl.bindTexture(gl.TEXTURE_2D, fontTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null)
  }
  
  function areTexturesLoaded() {
    return isFontTextureLoaded
  }

  return {
    use,
    render,
    setResolution,
    setPositions,
    setTextureCoords,
    loadFontTexture,
    areTexturesLoaded,
  }
}
