import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

const pointsPerCharacter = 4
const componentsPerPoint = 2
const componentsPerCharacter = pointsPerCharacter * componentsPerPoint

const TextAlignment = {
  BottomLeft: 'bottom-left',
  TopLeft: 'top-left',
  BottomRight: 'bottom-right',
  TopRight: 'top-right',
}

export const HeadsUpDisplayRenderer = (gl) => {
  const program = HeadsUpDisplayProgram(gl)
  const charSize = 8
  const textZoom = 4
  const resolution = { width: 0, height: 0}
  let fps = 0
  let speed = 0
  
  const instructions = [
    'F: FILL',
    'WHEEL: ZOOM',
    'LEFT CLICK: DRAW',
    'RIGHT CLICK: PAN',
  ]
  
  function setFPS(_) {
    fps = _
  }
  
  function setResolution(width, height) {
    resolution.width = width
    resolution.height = height
    program.setResolution(width, height)
  }
  
  function render() {
    if (!program.areTexturesLoaded())
      return
    
    program.use()
    const text = ('FPS ' + Math.round(fps).toString()).toUpperCase()
  
    // renderTextAligned(text, TextAlignment.BottomLeft)
    renderTextAligned(text, TextAlignment.TopLeft)
    renderTextAligned('SPEED: ' + speed.toString(), TextAlignment.BottomRight)
    renderTextAligned(text, TextAlignment.TopRight)
  
    renderMultiLineText(instructions, 0, 0)
  }
  
  function renderText(text, x, y) {
    const positions = new Float32Array(text.length * componentsPerCharacter)
    const textureCoords = new Float32Array(text.length * componentsPerCharacter)
  
    for (let i = 0; i < text.length; i++) {
      const letterIndex = text.codePointAt(i) - 65 + 33 // A=65. the texture has 33 special chars before A.
      const position = sizedRecToScreenCoords(x + charSize * i * textZoom, y, charSize * textZoom, charSize * textZoom)
      const texCoords = textureCoordsSprite(letterIndex, 0, 83, 1)
    
      for (let j = 0; j < componentsPerCharacter; j++) {
        positions[i * componentsPerCharacter + j] = position[j]
        textureCoords[i * componentsPerCharacter + j] = texCoords[j]
      }
    }
  
    program.setPositions(positions)
    program.setTextureCoords(textureCoords)
    program.render(positions.length / 2)
  }

  function alignText(text, alignment) {
    if (alignment === TextAlignment.BottomLeft)
      return [0, 0]
    if (alignment === TextAlignment.TopLeft)
      return [0, resolution.height - charSize * textZoom]
    if (alignment === TextAlignment.BottomRight)
      return [resolution.width - text.length * charSize * textZoom, 0]
    if (alignment === TextAlignment.TopRight)
      return [resolution.width - text.length * charSize * textZoom, resolution.height - charSize * textZoom]
    throw new Error(`Invalid alignment "${alignment}".`)
  }
  
  function renderTextAligned(text, alignment) {
    const textAlignment = alignText(text, alignment)
    renderText(text, textAlignment[0], textAlignment[1])
  }
  
  function renderMultiLineText(text, x, y) {
    const lines = typeof text === 'string' ? text.split('\n') : text
    
    for (let i = 0; i < lines.length; i++) {
      renderText(lines[i], x, y + (lines.length - 1) * charSize * textZoom - i * charSize * textZoom)
    }
    
  }
  
  return {
    render,
    setResolution,
    setFPS,
    setSpeed: (_) => { speed = _ },
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
  x/w,     (y+1)/h,
  x/w,     y/h,
  (x+1)/w, (y+1)/h,
  (x+1)/w, y/h,
])
