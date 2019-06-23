module.exports = {
  name: 'plugin-tinypng',
  type: 'compressor',
  accepts: ['image/png', 'image/jpeg'],
  extensions: ['png', 'jpg', 'jpeg'],
  process: 'renderer',
  main: './lib',
  disabled: false
}