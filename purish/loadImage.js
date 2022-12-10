export function loadImage(url, callback) {
  console.log('loading image', url)
  const image = new Image()
  image.onload = () => {
    console.log('image loaded', url)
    callback(image)
  }
  image.src = url
}
