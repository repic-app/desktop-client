
module.exports = {
  name: 'plugin-compressorjs',
  type: 'compressor',
  accepts: ['image/jpeg', 'image/webp'],
  process: 'renderer',
  main: './lib'
}