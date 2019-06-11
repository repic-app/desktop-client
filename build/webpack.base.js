var path = require('path')
  , fs = require('fs')
  , MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  target: 'electron-renderer',
  context: path.join(__dirname, '../renderer-src'),
  module: {
    //加载器配置
    rules: [
      { 
        test: /\.(scss|css)$/,
        use: [
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      }, {
        test: /\.(js|jsx)$/,
        exclude: [
          /node_modules/,
          /dist/
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              ...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.babelrc'))),
            },
          },
          'eslint-loader'
        ]
      }, {
        test: /\.(png|jpg|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100,
              name: 'images/[name].[ext]'
            }
          }
        ]
      }, {
        test: /\.(mp3|wav)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'sounds/[name].[ext]'
            }
          }
        ]
      }, {
        test: /\.(woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100,
              name: 'fonts/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, '../renderer-src'), 'node_modules'],
    alias: {
      'scssinc': path.join(__dirname, '../renderer-src/assets/scss/_inc.scss')
    },
    extensions: ['.js', '.jsx']
  }
}