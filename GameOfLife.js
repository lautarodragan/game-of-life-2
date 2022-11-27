import { Matrix } from './Matrix.js';

export const GameOfLife = (width, height) => {
  const matrix1 = new Matrix(width, height);
  const matrix2 = new Matrix(width, height);
  let matrix = matrix1

  const toggleValue = (x, y) => {
    matrix.setValue(x, y, !matrix.getValue(x, y))
  }

  const nextStep = () => {
    const oldMatrix = matrix
    const newMatrix = matrix === matrix1 ? matrix2 : matrix1

    for (let x = 0; x < newMatrix.width; x++) {
      for (let y = 0; y < newMatrix.height; y++) {
        const liveNeighbours = getLiveNeighbourCount(x, y);
        const newValue = getCellState(oldMatrix.getValue(x, y), liveNeighbours);

        newMatrix.setValue(x, y, newValue);
      }
    }

    matrix = newMatrix;
  }

  const getLiveNeighbourCount = (dx, dy) => {
    let count = 0;
    for (let x = dx - 1; x < dx + 2; x++) {
      for (let y = dy - 1; y < dy + 2; y++) {
        if (x === dx && y === dy)
          continue;
        if (matrix.isInBounds(x, y) && matrix.getValue(x, y))
          count++;
      }
    }
    return count;
  }

  return {
    get width() { return width },
    get height() { return height },
    isInBounds(x, y) { return matrix.isInBounds(x, y) },
    getValue(x, y) { return matrix.getValue(x, y) },
    setValue(x, y, v) { return matrix.setValue(x, y, v) },
    toggleValue,
    nextStep,
  }

}

const getCellState = (state, liveNeighbours) => {
  if (state === 1)
    return liveNeighbours < 2 || liveNeighbours > 3 ? 0 : 1;
  else
    return liveNeighbours === 3 ? 1 : 0;
}
