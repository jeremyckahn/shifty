const path = require('path');
const Webpack = require('webpack');

const { version } = require('./package.json');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/assets/',
    filename: 'shifty.js',
    library: 'shifty',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules'
    ]
  },
  plugins: [
    new Webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        unused: true
      },
      output: {
        comments: false
      },
      sourceMap: true
    }),
    new Webpack.BannerPlugin(version)
  ]
};
