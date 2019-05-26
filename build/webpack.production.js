var path = require('path')
  , merge = require('webpack-merge')
  // , BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  , MiniCssExtractPlugin = require('mini-css-extract-plugin')
  , OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
  , HtmlWebpackPlugin = require('html-webpack-plugin')
  , baseConfigs = require('./webpack.base')

module.exports = merge(baseConfigs, {
  mode: 'production',
  entry: {
    index: './index.jsx'
  },
  output: {
    path: path.join(__dirname, '../dist/renderer'),
    filename: '[name].js',
    chunkFilename: '[name].[chunkhash:4].js',
    publicPath: './',
    libraryTarget: 'umd'
  },
  optimization: {
    minimize: true
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /.css$/,
      cssProcessor: require('cssnano'),
      sourceMap: true,
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        },
        zindex: false,
        safe: true
      }
    }),
    new HtmlWebpackPlugin({
      minify: {},
      chunks: ['lib', 'index'],
      template: './index.html'
    })
  ]
})