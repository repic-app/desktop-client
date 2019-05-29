const imagemin = require('imagemin')
const imageminPngQuant = require('imagemin-pngquant')

const compressByImagemin = (filePath, options) => {

  return imagemin([filePath], {
    plugins: [
      imageminPngQuant({
        speed: 10,
        strip: options.stripMetedata,
        quality: [options.outputQuality * 1, options.outputQuality * 1]
      })
    ]
  }).then((result) => {
    return result[0]
  })

}

module.exports = { compressByImagemin }