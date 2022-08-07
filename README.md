# Shifty - The fastest JavaScript animation engine on the web

[![Current Shifty version](https://badgen.net/npm/v/shifty)](https://www.npmjs.com/package/shifty)

- `master`: [![CI](https://github.com/jeremyckahn/shifty/workflows/CI/badge.svg?branch=master)](https://github.com/jeremyckahn/shifty/actions?query=workflow%3ACI+branch%3Amaster)
- `develop`: [![CI](https://github.com/jeremyckahn/shifty/workflows/CI/badge.svg?branch=develop)](https://github.com/jeremyckahn/shifty/actions?query=workflow%3ACI+branch%3Adevelop)

Shifty is a tweening engine for JavaScript. It is a lightweight library meant
to be encapsulated by higher level tools. At its core, Shifty provides:

- Best-in-class performance
- Interpolation of `Number`s over time (tweening)
- Playback control of an individual tween
- Extensibility hooks for key points in the tweening process
- `Promise` support for `async`/`await` programming

This is useful because it is the least amount of functionality needed to build
customizable animations. Shifty is optimized to run many times a second with
minimal processing and memory overhead, which is necessary to achieve smooth
animations.

```js
import { tween } from 'shifty'
;(async () => {
  const element = document.querySelector('#tweenable')

  const { tweenable } = await tween({
    render: ({ scale, x }) => {
      element.style.transform = `translateX(${x}px) scale(${scale})`
    },
    easing: 'easeInOutQuad',
    duration: 500,
    from: { scale: 1, x: 0 },
    to: { x: 200 },
  })

  await tweenable.tween({
    to: { x: 0 },
  })

  await tweenable.tween({
    to: { scale: 3 },
  })
})()
```

## Installation

```
npm install --save shifty
```

## Environment compatibility

Shifty officially supports Evergreen browsers, Safari, and Node 10 and above.
If you encounter a browser-specific bug, please [open an issue about
it](https://github.com/jeremyckahn/shifty/issues/new)!

### IE compatibility

Shifty is compatible with IE11 (possibly older versions as well), but you
will need to provide your own polyfills for it to work. If you are using
https://polyfill.io/, you just need the `es6` features enabled:

```
https://polyfill.io/v3/polyfill.min.js?features=es6
```

[Here's a polyfilled demo of Shifty that works with
IE11](https://codepen.io/jeremyckahn/pen/RwbzvEj). Please see [issue
#113](https://github.com/jeremyckahn/shifty/issues/113) for background on
this.

## Support this project!

Shifty is a labor of love that will always be free and open source. If you've
gotten value out of Shifty, **[please consider supporting the developer with a
small donation](https://github.com/jeremyckahn#please-help-support-my-work)**!

## Developing Shifty

First, install the dependencies via npm like so:

```
npm install
```

Once those are installed, you can generate `dist/shifty.js` with:

```
npm run build
```

To run the tests:

```
npm test
```

To generate the documentation (`dist/doc`):

```
npm run doc
```

To generate live documentation to preview in your browser:

```
npm run doc:live
```

## Loading Shifty

Shifty exposes a UMD module, so you can load it however you like:

```javascript
// ES6
import { tween } from 'shifty'
```

Or:

```javascript
// AMD
define(['shifty'], function(shifty) {
  shifty.tween({ from: { x: 0 }, to: { x: 10 } })
})
```

Or even:

```javascript
// CommonJS
const { tween } = require('shifty')

tween({ from: { x: 0 }, to: { x: 10 } })
```

## Using Shifty

Please see the [Getting
Started](https://jeremyckahn.github.io/shifty/doc/tutorial-getting-started.html)
guide and check out the API documentation.

### Troubleshooting

#### Jest

With later versions of Jest [it is
known](https://github.com/jeremyckahn/shifty/issues/156) that by default Shifty
may cause warnings that look like:

```
Jest has detected the following 1 open handle potentially keeping Jest from exiting:
```

To prevent this, use
[`shouldScheduleUpdate`](https://jeremyckahn.github.io/shifty/doc/shifty.html#.shouldScheduleUpdate)
in your test setup like so:

```js
import { shouldScheduleUpdate } from 'shifty'

afterAll(() => {
  shouldScheduleUpdate(false)
})
```

## Releasing

Releases are done from the CLI. Assuming you have commit access, use [`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version) to tag and push a
new release in a single operation. This will kick off [a GitHub
action](https://github.com/jeremyckahn/shifty/blob/develop/.github/workflows/publish-package.yml)
that builds and publishes Shifty to NPM.

## Contributors

Take a peek at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors.

Special thanks goes to [Thomas Fuchs](https://twitter.com/thomasfuchs):
Shifty's easing formulas and Bezier curve code was adapted from his awesome
[Scripty2](https://github.com/madrobby/scripty2) project.

## License

Shifty is distributed under the [MIT
license](http://opensource.org/licenses/MIT). You are encouraged to use and
modify the code to suit your needs, as well as redistribute it.
