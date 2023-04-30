/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require('webpack')

const { version } = require('./package.json')

const config = {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      // All files with a '.ts' extension will be handled by 'ts-loader'.
      { test: /\.ts$/, loader: 'ts-loader' },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
  umdNamedDefine: true,
}

module.exports = [
  {
    ...config,
    target: ['web', 'es5'],
    output: {
      ...output,
      filename: 'shifty.js',
    },
  },
  {
    ...config,
    entry: './src/core.index.js',
    target: ['web', 'es5'],
    output: {
      ...output,
      filename: 'shifty.core.js',
    },
  },
  {
    ...config,
    target: 'node10',
    output: {
      ...output,
      filename: 'shifty.node.js',
    },
    optimization: {
      minimize: false,
    },
  },
]
