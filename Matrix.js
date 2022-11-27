export class Matrix {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.initialize();
  }

  initialize() {
    for (let x = 0; x < this.width; x++) {
      this.cells[x] = [];
      // this.cells[x].length = this.height;
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y] = 0;
      }
    }
  }

  getValue(x, y) {
    return this.cells[x][y];
  }

  setValue(x, y, value) {
    this.cells[x][y] = value;
  }

  isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

}
