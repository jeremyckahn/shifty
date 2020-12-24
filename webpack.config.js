/* global __dirname */
const path = require('path')
const Webpack = require('webpack')

const { version } = require('./package.json')

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
}

const output = {
  library: 'shifty',
  libraryTarget: 'umd',
  path: path.join(__dirname, 'dist'),
  umdNamedDefine: true,
}

const webEnvironmentConfig = {
  arrowFunction: false,
  const: false,
  destructuring: false,
  // forOf: false,
  module: false,
}

module.exports = [
  {
    ...config,
    target: 'web',
    output: {
      ...output,
      environment: webEnvironmentConfig,
      filename: 'shifty.js',
    },
  },
  {
    ...config,
    entry: './src/core.index.js',
    target: 'web',
    output: {
      ...output,
      environment: webEnvironmentConfig,
      filename: 'shifty.core.js',
    },
  },
  {
    ...config,
    target: 'node',
    output: {
      ...output,
      filename: 'shifty.node.js',
    },
    optimization: {
      minimize: false,
    },
  },
]
