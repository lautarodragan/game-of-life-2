export class Interval {
  constructor(callback, intervalTime) {
    this.callback = callback
    this.intervalTime = intervalTime
  }

  set intervalTime(intervalTime) {
    this.stop()
    this._intervalTime = intervalTime
    this.play()
  }

  get intervalTime() {
    return this._intervalTime
  }

  play() {
    this.interval = setInterval(this.callback, this.intervalTime)
  }

  stop() {
    clearInterval(this.interval)
    this.interval = null
  }

  toggle() {
    if (this.interval)
      this.stop()
    else
      this.play()
  }
}
