module.exports = {
  name: 'plugin-gifsicle',
  type: 'compressor',
  accepts: ['image/gif'],
  process: 'main',
  main: './lib',
  disabled: false
}