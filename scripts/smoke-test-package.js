/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Packs the project exactly as `npm publish` would, installs the tarball into
 * a throwaway project, and verifies that Node can load it via every supported
 * entry point. Run `npm run build` first.
 *
 * This exists because the Jest suite only exercises `src`, so it cannot catch
 * mistakes in `package.json`'s `exports` map or in the built bundles.
 */
const assert = require('assert')
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const root = path.join(__dirname, '..')
const { version } = require(path.join(root, 'package.json'))
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shifty-smoke-'))

const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe', ...options })

// Evaluate a snippet in a fresh Node process from inside the throwaway project
// so that resolution goes through node_modules, as it would for a real user.
const evalNode = (code, { esm = false } = {}) =>
  run(process.execPath, [...(esm ? ['--input-type=module'] : []), '-e', code], {
    cwd: tmp,
  }).trim()

let failures = 0

const check = (name, fn) => {
  try {
    fn()
    console.log(`  ok   ${name}`)
  } catch (e) {
    failures++
    console.error(`  FAIL ${name}\n${String(e.stderr || e.message)}`)
  }
}

try {
  const [tarball] = JSON.parse(
    run('npm', ['pack', '--json', '--pack-destination', tmp], { cwd: root })
  ).map(({ filename }) => filename)

  const pkgDir = path.join(tmp, 'node_modules', 'shifty')
  fs.mkdirSync(pkgDir, { recursive: true })
  run('tar', [
    '-xzf',
    path.join(tmp, tarball),
    '-C',
    pkgDir,
    '--strip-components=1',
  ])

  console.log(`Smoke testing shifty@${version} on Node ${process.version}`)

  check('require("shifty") loads the Node bundle', () => {
    const out = evalNode(`
      const { tween, Tweenable, VERSION } = require('shifty')
      console.log([typeof tween, typeof Tweenable, VERSION].join())
    `)
    assert.strictEqual(out, `function,function,${version}`)
  })

  check('import { tween } from "shifty" (named ESM imports)', () => {
    const out = evalNode(
      `
      import { tween, Tweenable, Scene, interpolate, VERSION } from 'shifty'
      console.log([typeof tween, typeof Tweenable, typeof Scene, typeof interpolate, VERSION].join())
    `,
      { esm: true }
    )
    assert.strictEqual(out, `function,function,function,function,${version}`)
  })

  check('import shifty from "shifty" (default ESM import)', () => {
    const out = evalNode(
      `
      import shifty from 'shifty'
      console.log(typeof shifty.tween)
    `,
      { esm: true }
    )
    assert.strictEqual(out, 'function')
  })

  check('ESM and CJS expose identical named exports', () => {
    const cjs = evalNode(
      `console.log(JSON.stringify(Object.keys(require('shifty')).sort()))`
    )
    const esm = evalNode(
      `
      import * as ns from 'shifty'
      console.log(JSON.stringify(Object.keys(ns).filter(k => k !== 'default').sort()))
    `,
      { esm: true }
    )
    assert.strictEqual(esm, cjs)
  })

  check('a tween actually runs to completion', () => {
    const out = evalNode(`
      const { tween } = require('shifty')
      tween({ from: { x: 0 }, to: { x: 10 }, duration: 20 })
        .then(({ state }) => {
          console.log(state.x)
          // Shifty's scheduler keeps the event loop alive, so exit explicitly.
          process.exit(0)
        })
    `)
    assert.strictEqual(out, '10')
  })

  check('deep imports of dist files are allowed', () => {
    evalNode(`require('shifty/dist/shifty.node.js')`)
    evalNode(`require('shifty/package.json')`)
    evalNode(`import('shifty/dist/shifty.node.mjs')`, { esm: true })
  })

  check('the browser bundle is still published and mapped', () => {
    const { exports: map } = require(path.join(pkgDir, 'package.json'))
    const { node, unpkg, types } = map['.']
    for (const file of [
      node.import.default,
      node.import.types,
      node.require.default,
      node.require.types,
      unpkg,
      types,
      map['.'].default,
    ]) {
      assert.ok(
        fs.existsSync(path.join(pkgDir, file)),
        `${file} is missing from the package`
      )
    }
  })
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

if (failures) {
  console.error(`\n${failures} smoke test(s) failed`)
  process.exit(1)
}

console.log('\nAll smoke tests passed')
