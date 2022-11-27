import { Matrix } from './Matrix.js';

export class GameOfLife {
  constructor(width, height) {
    this.matrix1 = new Matrix(width, height);
    this.matrix2 = new Matrix(width, height);
    this.matrix = this.matrix1
  }

  get width() {
    return this.matrix.width;
  }

  get height() {
    return this.matrix.height;
  }

  isInBounds(x, y) {
    return this.matrix.isInBounds(x, y)
  }

  getValue(x, y) {
    return this.matrix.getValue(x, y)
  }

  setValue(x, y, value) {
    this.matrix.setValue(x, y, value)
  }

  toggleValue(x, y) {
    this.matrix.setValue(x, y, !this.matrix.getValue(x, y))
  }

  nextStep() {
    const oldMatrix = this.matrix
    const newMatrix = this.matrix === this.matrix1 ? this.matrix2 : this.matrix1

    for (let x = 0; x < newMatrix.width; x++) {
      for (let y = 0; y < newMatrix.height; y++) {
        const liveNeighbours = this.getLiveNeighbourCount(x, y);
        const newValue = getCellState(oldMatrix.getValue(x, y), liveNeighbours);

        newMatrix.setValue(x, y, newValue);
      }
    }

    this.matrix = newMatrix;
  }

  getLiveNeighbourCount(dx, dy) {
    let count = 0;
    for (let x = dx - 1; x < dx + 2; x++) {
      for (let y = dy - 1; y < dy + 2; y++) {
        if (x === dx && y === dy)
          continue;
        if (this.matrix.isInBounds(x, y) && this.matrix.getValue(x, y))
          count++;
      }
    }
    return count;
  }

}

const getCellState = (state, liveNeighbours) => {
  if (state === 1)
    return liveNeighbours < 2 || liveNeighbours > 3 ? 0 : 1;
  else
    return liveNeighbours === 3 ? 1 : 0;
}
