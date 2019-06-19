
module.exports = {
  name: 'plugin-pngcrush',
  type: 'compressor',
  accepts: ['image/png'],
  process: 'main',
  main: './lib',
  disabled: true
}