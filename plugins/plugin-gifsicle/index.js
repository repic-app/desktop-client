module.exports = {
  name: 'plugin-gifsicle',
  title: 'Gifsicle',
  description: '用于压缩gif格式的图片',
  type: 'compressor',
  accepts: ['image/gif'],
  extensions: ['gif'],
  process: 'main',
  main: './lib'
}