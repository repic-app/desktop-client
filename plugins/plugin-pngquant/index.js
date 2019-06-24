
module.exports = {
  name: 'plugin-pngquant',
  title: 'PngQuant',
  description: '用于压缩png格式的图片，压缩速度快、压缩率高，但是出图质量欠佳',
  type: 'compressor',
  accepts: ['image/png'],
  extensions: ['png'],
  process: 'main',
  main: './lib'
}