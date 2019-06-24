
module.exports = {
  name: 'plugin-ghostscript',
  title: 'GhostScript',
  description: '适合用于压缩矢量内容的pdf文件，对于纯图片内容或者扫描版的pdf文件可能会造成内容模糊难以阅读',
  type: 'compressor',
  accepts: ['application/pdf'],
  extensions: ['pdf'],
  process: 'main',
  main: './lib'
}