import { Matrix } from './Matrix.js';

export const GameOfLife = (width, height) => {
  const matrix1 = new Matrix(width, height);
  const matrix2 = new Matrix(width, height);
  let matrix = matrix1
  let _decay = 0x1f

  const toggleValue = (x, y) => {
    matrix.setValue(x, y, matrix.getValue(x, y) ? 0 : 0xff)
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
        if (matrix.isInBounds(x, y) && matrix.getValue(x, y) === 0xff)
          count++;
      }
    }
    return count;
  }

  const getCellState = (state, liveNeighbours) => {
    if (state === 0xff)
      return liveNeighbours < 2 || liveNeighbours > 3 ? Math.max(state - _decay, 0) : 0xff;
    else
      return liveNeighbours === 3 ? 0xff : Math.max(state - _decay, 0);
  }

  const clear = () => {
    matrix1.clear()
    matrix2.clear()
  }

  const random = () => {
    for (let i = 0; i < matrix1.cells.length; i++) {
      matrix1.cells[i] = matrix2.cells[i] = Math.random() > .75 ? 0xff : 0
    }
  }

  const getLiveCount = () => {
    let count = 0

    for (let i = 0; i < matrix.cells.length; i++)
      if (matrix.cells[i])
        count++

    return count
  }

  return {
    get width() { return width },
    get height() { return height },
    get decay() { return _decay },
    set decay(v) { _decay = Math.min(Math.max(v, 0), 0xff) },
    isInBounds(x, y) { return matrix.isInBounds(x, y) },
    getValue(x, y) { return matrix.getValue(x, y) },
    setValue(x, y, v) { return matrix.setValue(x, y, v) },
    toggleValue,
    nextStep,
    clear,
    random,
    getLiveCount,
  }

}


