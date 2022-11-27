export class Matrix {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.initialize();
  }

  initialize() {
    this.cells = new Uint8Array(this.width * this.height);
  }

  getValue(x, y) {
    if (!this.isInBounds(x, y)) {
      throw new Error(`Not in bounds: ${x}, ${y}`)
    }

    return this.cells[x + y * this.width]
  }

  setValue(x, y, value) {
    if (!this.isInBounds(x, y)) {
      throw new Error(`Not in bounds: ${x}, ${y}`)
    }

    this.cells[x + y * this.width] = value;
  }

  isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

}
