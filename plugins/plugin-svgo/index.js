module.exports = {
  name: 'plugin-svgo',
  type: 'compressor',
  accepts: ['image/svg+xml'],
  process: 'main',
  main: './lib'
}