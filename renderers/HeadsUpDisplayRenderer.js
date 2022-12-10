import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

export const HeadsUpDisplayRenderer = (gl) => {
  const program = HeadsUpDisplayProgram(gl)
  let fps = 0

  function render() {
    if (!program.areTexturesLoaded())
      return
    
    document.title = `FPS: ${Math.round(fps)}`
  
    const text = 'FPS ' + Math.round(fps).toString()
    const positions = new Float32Array(text.length * 4 * 2)
    const textureCoords = new Float32Array(text.length * 4 * 2)
    const charSize = 8
    const textZoom = 4
    
    for (let i = 0; i < text.length; i++) {
      const letterIndex = text.toUpperCase().codePointAt(i) - 65 + 33
      const position = screenToViewPort(charSize * i, 0, charSize * textZoom, charSize * textZoom)
      const texCoords = screenToViewPort(charSize * letterIndex, 0, charSize, charSize)
      
      for (let j = 0; j < 4 * 2; j++) {
        positions[i * 4 * 2 + j] = position[j]
        textureCoords[i * 4 * 2 + j] = texCoords[j]
      }
    }
  
    program.use()
    program.setPositions(positions)
    program.setTextureCoords(textureCoords)
    program.render(positions.length / 2)
  }
  
  function setFPS(_) {
    fps = _
  }
  
  return {
    render,
    setResolution: program.setResolution,
    setFPS,
    loadFontTexture: program.loadFontTexture,
  }
}

const screenToViewPort = (x, y, w, h) => new Float32Array([
  x,     y,
  x,     (y+h),
  (x+w), y,
  (x+w), (y+h),
])
