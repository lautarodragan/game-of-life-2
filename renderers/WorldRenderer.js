import { WorldProgram } from '../programs/WorldProgram.js'

export const WorldRenderer = (device, format, game, camera) => {
  const program = WorldProgram(device, format)

  function render(pass) {
    const liveCellCount = game.getLiveCount()
    let liveCellIndex = 0

    const colors = new Float32Array(liveCellCount * 6 * 3)
    const positions = new Float32Array(liveCellCount * 6 * 2)

    for (let x = 0; x < game.width; x++) {
      for (let y = 0; y < game.height; y++) {
        const life = game.getValue(x, y)

        if (!life)
          continue

        const rgb = randomColorWithDecay(life)

        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 3; j++) {
            colors[liveCellIndex * 6 * 3 + i * 3 + j] = rgb[j]
          }
        }

        const vertices = positionsScreen(
          x * camera.z - camera.x + camera.w / 2 - game.width / 2 * camera.z,
          y * camera.z - camera.y + camera.h / 2 - game.height / 2 * camera.z,
          camera.z,
          camera.z,
        )

        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 2; j++) {
            positions[liveCellIndex * 6 * 2 + i * 2 + j] = vertices[i * 2 + j]
          }
        }

        liveCellIndex++
      }
    }

    program.setColors(colors)
    program.setPositions(positions)
    program.render(pass, positions.length / 2)
  }

  return {
    render,
    setResolution: program.setResolution,
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

const randomColorWithDecay = (life) => new Float32Array([
  Math.random() * life / 0xff,
  Math.random() * life / 0xff,
  Math.random() * life / 0xff,
])
