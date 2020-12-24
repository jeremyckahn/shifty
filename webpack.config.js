const Webpack = require('webpack')

const { version } = require('./package.json')

const config = {
  mode: 'production',
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
