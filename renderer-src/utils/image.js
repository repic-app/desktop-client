export const createThumbnail = (url, width = 1280, height = 800, quality = 1, toBlob = false) => {

  return new Promise((resolve, reject) => {

    const image = new Image()

    image.src = url

    image.onerror = function (error) {
      reject(error)
    }

    image.onload = function () {

      try {

        const compressCanvas = document.createElement('canvas')
        const scale = width && height ? ((this.width > width || this.height > height) ? (this.width > this.height ? width / this.width : height / this.height) : 1) : 1

        compressCanvas.width = this.width * scale
        compressCanvas.height = this.height * scale

        const canvasContext = compressCanvas.getContext('2d')
        canvasContext.drawImage(this, 0, 0, compressCanvas.width, compressCanvas.height)

        if (toBlob) {
          compressCanvas.toBlob((data) => {
            resolve({
              data,
              width: compressCanvas.width,
              height: compressCanvas.height
            })
          }, 'image/png', quality)
        } else {
          resolve({
            url: compressCanvas.toDataURL('image/png', quality),
            width: compressCanvas.width,
            height: compressCanvas.height
          })
        }

      } catch (error) {
        reject(error)
      }

    }

  })

}