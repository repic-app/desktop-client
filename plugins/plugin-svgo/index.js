module.exports = {
  name: 'plugin-svgo',
  title: 'SVGO',
  description: '用于压缩svg格式的图片，可能会更改出图尺寸和造成内容失真',
  type: 'compressor',
  accepts: ['image/svg+xml'],
  extensions: ['svg'],
  process: 'main',
  main: './lib'
}