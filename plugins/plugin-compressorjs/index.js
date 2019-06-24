module.exports = {
  name: 'plugin-compressorjs',
  title: 'CompressorJS',
  description: '用于压缩jpg和webp格式的图片',
  type: 'compressor',
  accepts: ['image/jpeg', 'image/webp'],
  extensions: ['jpg', 'jpeg', 'webp'],
  process: 'renderer',
  main: './lib'
}