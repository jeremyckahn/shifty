const path = require('path');
const Webpack = require('webpack');

const modulePaths = [
  'scripts',
  path.join(__dirname, 'node_modules')
];

module.exports = {
  entry: './test/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/assets/',
    filename: 'index.js',
    library: 'index',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  resolveLoader: {
    // http://webpack.github.io/docs/troubleshooting.html#npm-linked-modules-doesn-t-find-their-dependencies
    fallback: modulePaths
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: 'node_modules',
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    modulesDirectories: modulePaths,

    // http://webpack.github.io/docs/troubleshooting.html#npm-linked-modules-doesn-t-find-their-dependencies
    fallback: modulePaths
  },
  devServer: {
    port: 9009
  }
};
