import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

const pointsPerCharacter = 4
const componentsPerPoint = 2
const componentsPerCharacter = pointsPerCharacter * componentsPerPoint

export const HeadsUpDisplayRenderer = (gl) => {
  const program = HeadsUpDisplayProgram(gl)
  const charSize = 8
  const textZoom = 4
  let fps = 0

  function render() {
    if (!program.areTexturesLoaded())
      return
    
    document.title = `FPS: ${Math.round(fps)}`
  
    const text = ('FPS ' + Math.round(fps).toString()).toUpperCase()
    const positions = new Float32Array(text.length * componentsPerCharacter)
    const textureCoords = new Float32Array(text.length * componentsPerCharacter)
    
    for (let i = 0; i < text.length; i++) {
      const letterIndex = text.codePointAt(i) - 65 + 33 // A=65. the texture has 33 special chars before A.
      const position = sizedRecToScreenCoords(charSize * i * textZoom, 0, charSize * textZoom, charSize * textZoom)
      const texCoords = textureCoordsSprite(letterIndex, 0, 83, 1)
      
      for (let j = 0; j < componentsPerCharacter; j++) {
        positions[i * componentsPerCharacter + j] = position[j]
        textureCoords[i * componentsPerCharacter + j] = texCoords[j]
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

const sizedRecToScreenCoords = (x, y, w, h) => new Float32Array([
  x,    y,
  x,    y+h,
  x+w,  y,
  x+w,  y+h,
])

export const textureCoordsSprite = (x, y, w, h) => new Float32Array([
  x/w,     y/h,
  x/w,     (y+1)/h,
  (x+1)/w, y/h,
  (x+1)/w, (y+1)/h,
])
