/* global __dirname */
const path = require('path');
const Webpack = require('webpack');

const { version } = require('./package.json');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'shifty.js',
    library: 'shifty',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
  },
  plugins: [
    new Webpack.BannerPlugin(
      `Shifty ${version} - https://github.com/jeremyckahn/shifty`
    ),
  ],
};
