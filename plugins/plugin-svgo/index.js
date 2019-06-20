module.exports = {
  name: 'plugin-svgo',
  type: 'compressor',
  accepts: ['image/svg+xml'],
  extensions: ['svg'],
  process: 'main',
  main: './lib',
  disabled: false
}