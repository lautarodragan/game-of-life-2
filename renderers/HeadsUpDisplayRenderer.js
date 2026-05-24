import { HeadsUpDisplayProgram } from '../programs/HeadsUpDisplayProgram.js'

const verticesPerCharacter = 6
const componentsPerVertex2 = 2

const TextAlignment = {
  BottomLeft: 'bottom-left',
  TopLeft: 'top-left',
  BottomRight: 'bottom-right',
  TopRight: 'top-right',
}

export const HeadsUpDisplayRenderer = (device, format) => {
  const program = HeadsUpDisplayProgram(device, format)
  const charSize = 8
  const resolution = { width: 0, height: 0 }
  let fps = 0
  let speed = 0
  let decay = 0
  let textZoom = 4

  const instructions = [
    'LEFT CLICK: DRAW',
    'RIGHT CLICK: PAN',
    'WHEEL: ZOOM',
    'UP/DOWN: INC/DEC DECAY RATE',
    'F: FILL',
    'R: CLEAR',
    'SPACE: PLAY/PAUSE',
  ]

  // Per-frame accumulators
  let positionsAcc, texCoordsAcc, layersAcc, charsAcc

  function setFPS(_) {
    fps = _
  }

  function setResolution(width, height) {
    resolution.width = width
    resolution.height = height
    program.setResolution(width, height)
  }

  function render(pass) {
    if (!program.areTexturesLoaded())
      return

    const stats = [
      'FPS: ' + Math.round(fps).toString(),
      'SPEED: ' + speed.toString(),
      'DECAY: ' + decay.toString(),
    ]

    const totalChars = countChars(instructions) + countChars(stats)
    positionsAcc = new Float32Array(totalChars * verticesPerCharacter * componentsPerVertex2)
    texCoordsAcc = new Float32Array(totalChars * verticesPerCharacter * componentsPerVertex2)
    layersAcc = new Uint8Array(totalChars * verticesPerCharacter)
    charsAcc = 0

    pushMultiLineText(instructions, 0, 0)
    pushMultiLineTextAligned(stats, TextAlignment.BottomRight)

    program.setPositions(positionsAcc)
    program.setTextureCoords(texCoordsAcc)
    program.setLayers(layersAcc)
    program.render(pass, charsAcc * verticesPerCharacter)
  }

  function countChars(lines) {
    let n = 0
    for (let i = 0; i < lines.length; i++) n += lines[i].length
    return n
  }

  function pushText(text, x, y) {
    for (let i = 0; i < text.length; i++) {
      const letterIndex = text.codePointAt(i) - 65 + 33
      const cx = x + charSize * i * textZoom
      const cy = y
      const w = charSize * textZoom
      const h = charSize * textZoom

      // Two triangles: (BL, TL, BR), (TL, BR, TR)
      const verts = [
        cx,     cy,        // BL
        cx,     cy + h,    // TL
        cx + w, cy,        // BR
        cx,     cy + h,    // TL
        cx + w, cy,        // BR
        cx + w, cy + h,    // TR
      ]
      const uvs = [
        0, 1,
        0, 0,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
      ]

      const baseV = charsAcc * verticesPerCharacter
      for (let j = 0; j < verticesPerCharacter; j++) {
        positionsAcc[(baseV + j) * 2 + 0] = verts[j * 2 + 0]
        positionsAcc[(baseV + j) * 2 + 1] = verts[j * 2 + 1]
        texCoordsAcc[(baseV + j) * 2 + 0] = uvs[j * 2 + 0]
        texCoordsAcc[(baseV + j) * 2 + 1] = uvs[j * 2 + 1]
        layersAcc[baseV + j] = letterIndex
      }

      charsAcc++
    }
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

  function pushMultiLineText(text, x, y) {
    const lines = typeof text === 'string' ? text.split('\n') : text

    for (let i = 0; i < lines.length; i++) {
      pushText(lines[i], x, y + (lines.length - 1) * charSize * textZoom - i * charSize * textZoom)
    }
  }

  function pushMultiLineTextAligned(text, alignment) {
    if (alignment === TextAlignment.BottomLeft) {
      pushMultiLineText(text, 0, 0)
    } else if (alignment === TextAlignment.BottomRight) {
      const maxWidth = text.map(line => line.length).reduce((line, acc) => line > acc ? line : acc, 0)
      pushMultiLineText(text, resolution.width - maxWidth * charSize * textZoom, 0)
    }
  }

  return {
    render,
    setResolution,
    setFPS,
    setSpeed: (_) => { speed = _ },
    setDecay: (_) => { decay = _ },
    get textZoom() { return textZoom },
    set textZoom(_) { textZoom = _ },
    loadFontTexture: program.loadFontTexture,
  }
}
