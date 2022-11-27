import { Matrix } from './Matrix.js';

export class GameOfLife {
  constructor(width, height) {
    this.matrix = new Matrix(width, height);
  }

  get width() {
    return this.matrix.width;
  }

  get height() {
    return this.matrix.height;
  }

  getValue(x, y) {
    return this.matrix.getValue(x, y)
  }

  setValue(x, y, value) {
    this.matrix.setValue(x, y, value)
  }

  nextStep() {
    const newState = new Matrix(this.matrix.width, this.matrix.height);

    for (let x = 0; x < this.matrix.width; x++) {
      for (let y = 0; y < this.matrix.height; y++) {
        const liveNeighbours = this.getLiveNeighbourCount(x, y);
        const newValue = this.getCellState(this.matrix.getValue(x, y), liveNeighbours);

        newState.setValue(x, y, newValue);
      }
    }

    this.matrix = newState;
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

  getCellState(state, liveNeighbours) {
    if (state === 1)
      return liveNeighbours < 2 || liveNeighbours > 3 ? 0 : 1;
    else
      return liveNeighbours === 3 ? 1 : 0;
  }

}
