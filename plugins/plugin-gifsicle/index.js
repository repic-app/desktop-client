module.exports = {
  name: 'plugin-gifsicle',
  type: 'compressor',
  accepts: ['image/gif'],
  extensions: ['gif'],
  process: 'main',
  main: './lib',
  disabled: false
}