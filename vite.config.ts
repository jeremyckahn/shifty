import { defineConfig, UserConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('./package.json')
const banner = `/*!
 * Shifty ${version} - https://github.com/jeremyckahn/shifty
 *
 * @license
 * Shifty is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
`

const baseConfig: UserConfig = {
    plugins: [dts({
        insertTypesEntry: true,
    })],
    define: {
      'process.env.PACKAGE_VERSION': JSON.stringify(version)
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'shifty',
        formats: ['umd'],
      },
      sourcemap: true,
      banner,
    }
}

export default defineConfig(({ mode }) => {
  if (mode === 'browser') {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
            ...(baseConfig.build.lib),
            fileName: () => 'shifty.js',
        },
        target: 'es2015',
      }
    }
  }

  if (mode === 'node') {
    return {
      ...baseConfig,
      build: {
        ...baseConfig.build,
        lib: {
            ...(baseConfig.build.lib),
            fileName: () => 'shifty.node.js',
        },
        target: 'node10',
        minify: false,
      }
    }
  }

  // Default config for dev server and other modes
  return baseConfig;
})
