var webpack = require('webpack')
  , merge = require('webpack-merge')
  , path = require('path')
  , HtmlWebpackPlugin = require('html-webpack-plugin')
  , baseConfigs = require('./webpack.base')
  , MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(baseConfigs, {
  mode: 'development',
  devtool: 'source-map',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8188',
    'webpack/hot/only-dev-server',
    './index.jsx'
  ],
  output: {
    path: path.resolve(__dirname, '../renderer'),
    publicPath: '/',
    filename: '[name].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new webpack.NamedModulesPlugin(),
  ],
  devServer: {
    publicPath: '/',
    stats: { chunks:false },
    // contentBase: './src',
    port: 8188,
    hot: true
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  }
})