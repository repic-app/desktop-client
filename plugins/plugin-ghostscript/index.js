
module.exports = {
  name: 'plugin-ghostscript',
  type: 'compressor',
  accepts: ['application/pdf'],
  extensions: ['pdf'],
  process: 'main',
  main: './lib',
  disabled: false
}