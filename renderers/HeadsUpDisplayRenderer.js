import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

export const HeadsUpDisplayRenderer = (gl) => {
  let fps = 0
  // const program = HeadsUpDisplayProgram(gl)

  function render() {
    document.title = `FPS: ${Math.round(fps)}`
    
    return
    
    // const positions = new Float32Array(30)
    
    // program.setPositions(positions)
    // program.render(positions.length / 2)
  }
  
  function setFPS(_) {
    fps = _
  }

  return {
    render,
    // setResolution: program.setResolution,
    setFPS,
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
