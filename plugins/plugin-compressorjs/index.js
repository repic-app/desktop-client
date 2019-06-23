module.exports = {
  name: 'plugin-compressorjs',
  type: 'compressor',
  accepts: ['image/jpeg', 'image/webp'],
  extensions: ['jpg', 'jpeg', 'webp'],
  process: 'renderer',
  main: './lib',
  disabled: true
}