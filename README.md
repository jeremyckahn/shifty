# Shifty - A teeny tiny tweening engine in JavaScript

Shifty is a tweening engine for JavaScript. It is a lightweight library meant
to be encapsulated by higher level tools. At its core, Shifty provides:

- Interpolation of `Number`s over time (tweening)
- Playback control of an individual tween
- Extensibility hooks for key points in the tweening process

This is useful because it is the least amount of functionality needed to build
customizable animations. Shifty is optimized to run many times a second with
minimal processing and memory overhead, which is necessary to achieve smooth
animations.

## Installation

```
npm install --save shifty
```

## Browser compatibility

Shifty officially supports Evergreen browsers, Safari, and Node. If you
encounter a browser-specific bug, please [open an issue about
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

To generate live documentation in your browser:

```
npm run doc:live
```

## Loading Shifty

Shifty exposes a UMD module, so you can load it however you like:

```javascript
// ES6
import { tween } from 'shifty';
```

Or:

```javascript
// AMD
define(['shifty'], function(shifty) {
  shifty.tween({ from: { x: 0 }, to: { x: 10 } });
});
```

Or even:

```javascript
// CommonJS
// Shifty is packaged for ES6 environments, so it exposes an object called
// `shifty`. To use it with CommonJS loaders (like Node's `require`), access
// the properties within that object.
const shifty = require('shifty').shifty;

shifty.tween({ from: { x: 0 }, to: { x: 10 } });
```

## Using Shifty

Please see the [Getting
Started](https://jeremyckahn.github.io/shifty/doc/tutorial-getting-started.html)
guide and check out the API documentation.

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
