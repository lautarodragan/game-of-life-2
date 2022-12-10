import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

export const HeadsUpDisplayRenderer = (gl) => {
  const program = HeadsUpDisplayProgram(gl)
  let fps = 0
  // let fontTexture = null

  function render() {
    document.title = `FPS: ${Math.round(fps)}`
    
    // if (!fontTexture)
    //   return
  
    const positions = new Float32Array(30)
    const textureCoords = new Float32Array(30)
  
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

const positionsScreen = (x, y, w, h) => new Float32Array([
  x,     (y+h),
  (x+w), (y+h),
  x,     y,
  (x+w), y,
  x,     y,
  (x+w), (y+h),
])
