/* global __dirname */
const path = require('path');
const Webpack = require('webpack');

const { version } = require('./package.json');

const config = {
  mode: 'production',
  entry: './src/index.js',
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

module.exports = [
  {
    ...config,
    target: 'web',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'shifty.js',
      library: 'shifty',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  },
  {
    ...config,
    target: 'node',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'shifty.node.js',
      library: 'shifty',
      libraryTarget: 'commonjs',
      umdNamedDefine: true,
    },
  },
];
