
module.exports = {
  name: 'plugin-pngquant',
  type: 'compressor',
  accepts: ['image/png'],
  process: 'main',
  main: './lib',
  disabled: false
}