
module.exports = {
  name: 'plugin-pngquant',
  type: 'compressor',
  accepts: ['image/png'],
  extensions: ['png'],
  process: 'main',
  main: './lib',
  disabled: true
}