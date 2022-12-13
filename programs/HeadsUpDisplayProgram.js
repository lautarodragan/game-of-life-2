import { createProgram } from './createProgram.js'
import { fragmentShaderSource, vertexShaderSource } from '../shaders/hud.js'
import { loadImage } from '../purish/loadImage.js'

export const HeadsUpDisplayProgram = (gl) => {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)

  const uResolution = gl.getUniformLocation(program, 'uResolution')
  const uSampler = gl.getUniformLocation(program, 'uSampler')

  const positionBuffer = gl.createBuffer()
  const textureCoordBuffer = gl.createBuffer()
  const layerBuffer = gl.createBuffer()
  
  const fontTexture = gl.createTexture()
  
  let isFontTextureLoaded = false
  
  gl.uniform1i(uSampler, 0)

  const position = gl.getAttribLocation(program, 'aVertexPosition')
  gl.enableVertexAttribArray(position)
  
  const textureCoord = gl.getAttribLocation(program, 'aTextureCoord')
  gl.enableVertexAttribArray(textureCoord)
  
  const layer = gl.getAttribLocation(program, 'aLayer')
  gl.enableVertexAttribArray(layer)
  
  function use() {
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, fontTexture)
    gl.useProgram(program)
  }
  
  function render(count) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, count)
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
  
  function setLayers(layers) {
    gl.bindBuffer(gl.ARRAY_BUFFER, layerBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, layers, gl.STATIC_DRAW)
    gl.vertexAttribIPointer(layer, 1, gl.UNSIGNED_BYTE, 0, 0)
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
  
  function imageToPixels(image, invert = false, tileSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // https://github.com/WebKit/WebKit/blob/a9b66fad8de2f2a774d86bfd78afa01b77f6df8a/Source/WebCore/html/canvas/WebGLRenderingContextBase.h#L885
    // According to the WebGL 2.0 spec, specifying depth > 1 means to select multiple rectangles stacked vertically.
  
    if (invert) { // if (image.width > tileSize)
      canvas.width = tileSize;
      canvas.height = image.width;
      for (let x = 0; x < image.width / tileSize; x++) {
        ctx.drawImage(image, x * tileSize, 0, tileSize, tileSize, 0, x * tileSize, tileSize, tileSize);
      }
      document.body.appendChild(canvas)
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return new Uint8Array(imageData.data.buffer);
  }
  
  function fontImageToTexture(image) {
    const tileSize = 8
    const tileCount = image.height / tileSize
    // console.log('fontImageToTexture', image.width, image.height, tileCount)
    // const pixels = imageToPixels(image, false, tileSize)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, fontTexture)
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      gl.RGBA,
      tileSize,
      tileSize,
      tileCount,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    )
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null)
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
    setLayers,
    loadFontTexture,
    areTexturesLoaded,
  }
}
