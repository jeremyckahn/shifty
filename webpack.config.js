const path = require('path');
const Webpack = require('webpack');

const { version } = require('./package.json');
const isProduction = process.env.NODE_ENV === 'production';

const modulePaths = [
  'scripts',
  path.join(__dirname, 'node_modules')
];

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
  plugins: [
    new Webpack.optimize.UglifyJsPlugin({
      compress: {
        dead_code: true,
        unused: true
      },
      output: {
        comments: false
      }
    }),
    new Webpack.BannerPlugin(version),
    //new Webpack.DefinePlugin({
      //SHIFTY_DEBUG_NOW: true
    //})
  ],
  devServer: {
    port: 9009
  }
};
