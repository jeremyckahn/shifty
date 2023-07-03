# Shifty - The fastest TypeScript animation engine on the web

[![Current Shifty version](https://badgen.net/npm/v/shifty)](https://www.npmjs.com/package/shifty)

- `main`: [![CI](https://github.com/jeremyckahn/shifty/workflows/CI/badge.svg?branch=main)](https://github.com/jeremyckahn/shifty/actions?query=workflow%3ACI+branch%3Amain)

Shifty is a tweening engine for TypeScript. It is a lightweight library meant
to be encapsulated by higher level tools. At its core, Shifty provides:

- Best-in-class animation performance
- Playback control of an individual tween
- Extensibility hooks for key points in the tween lifecycle
- `Promise` support for `async`/`await` programming

This is useful because it is the least amount of functionality needed to build
customizable animations. Shifty is optimized to run with the minimal processing
and memory overhead.

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
Internet Explorer is supported by
[v2](https://github.com/jeremyckahn/shifty/tree/v2) If you encounter a
browser-specific bug, please [open an issue about
it](https://github.com/jeremyckahn/shifty/issues/new)!

## Support this project!

Shifty is a labor of love that will always be free and open source. If you've
gotten value out of Shifty, **[please consider supporting the developer with a
small donation](https://github.com/jeremyckahn#please-help-support-my-work)**!

## Developing Shifty

First, install the development dependencies via NPM:

```
npm ci
```

Once those are installed, you can generate `dist/shifty.js` with:

```
npm run build
```

To run the tests:

```
npm test
```

To generate the documentation (in `dist/doc`):

```
npm run doc
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

See the [Getting
Started](https://jeremyckahn.github.io/shifty/doc/pages/tutorials/getting-started.html)
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

## Breaking changes

### From v2 to v3

Shifty's legacy version 2 remains available in the
[v2](https://github.com/jeremyckahn/shifty/tree/v2) branch. Legacy
documentation can be found at:
https://shifty-git-v2-jeremyckahn.vercel.app/

- `Tweenable.formulas` has been renamed to `Tweenable.easing`
- `tweenConfig.step` has been removed in favor of `tweenConfig.render`
  (behavior and API is unchanged).
- `tweenConfig.attachment` has been removed in favor of `tweenConfig.data`
  (behavior and API is unchanged).
- `Tweenable#tweenable` has been removed.
- `Tweenable#set()` is now `Tweenable#setState`.
- `Tweenable#get()` is now `Tweenable#state` (a getter, not a method).
- `Tweenable#hasEnded()` is now `Tweenable#hasEnded` (a getter, not a method).
- `Tweenable#isPlaying()` is now `Tweenable#isPlaying` (a getter, not a
  method).
- `Tweenable#setScheduleFunction` has been removed. The static method
  `Tweenable.setScheduleFunction` method should be used instead.
- Render handler parameters have been reordered:
  - In v2, the function signature was `(state: TweenState, data: Data, timeElapsed: number) => void`
  - In v3, the function signature was `(state: TweenState, timeElapsed: number, data: Data) => void`
- `Scene#play()` has been renamed to `Scene#tween`.
- `Scene#isPlaying()` is now `Scene#isPlaying` (a getter, not a method).
- `Scene#playingTweenables()` has been removed.
- `unsetBezierFunction` has been removed.
- Shifty "Core" build has been removed.

#### Non-breaking changes

- Token extension is now baked into Shifty Core.

## Contributors

Take a look at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors.

Special thanks goes to [Thomas Fuchs](https://twitter.com/thomasfuchs):
Shifty's easing functions and Bezier curve code was adapted from his awesome
[Scripty2](https://github.com/madrobby/scripty2) project.

## License

Shifty is distributed under the [MIT
license](http://opensource.org/licenses/MIT). You are encouraged to use and
modify the code to suit your needs, as well as redistribute it.
