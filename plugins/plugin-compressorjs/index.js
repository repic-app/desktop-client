
module.exports = {
  name: 'plugin-compressorjs',
  type: 'compressor',
  accepts: ['jpeg', 'jpg', 'webp'],
  process: 'renderer',
  main: './lib'
}