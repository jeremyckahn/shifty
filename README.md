# Shifty - A teeny tiny tweening engine in JavaScript

Shifty is a tweening engine for JavaScript.  It is a lightweight library meant
to be encapsulated by higher level tools.  At its core, Shifty provides:

  * Interpolation of `Number`s over time (tweening)
  * Playback control of an individual tween
  * Extensibility hooks for key points in the tweening process

This is useful because it is the least amount of functionality needed to build
customizable animations. Shifty is optimized to run many times a second with
minimal processing and memory overhead, which is necessary to achieve smooth
animations.

## Browser compatibility

Shifty officially supports Evergreen browsers.

## Installation

```
npm install --save shifty
```

## Getting started

This section explains how to get started with Shifty.  For full documentation
on each method, please see [the API
documentation](http://jeremyckahn.github.io/shifty/doc/).

## Creating a tween

```javascript
import { tween } from 'shifty';

tween({
  from: { x: 0,  y: 50  },
  to: { x: 10, y: -30 },
  duration: 1500,
  easing: 'easeOutQuad',
  step: state => console.log(state)
}).then(
  () => console.log('All done!')
);
```

## Easing formulas

Shifty supports a number of easing formulas, which you can see in
[`easing-functions.js`](src/easing-functions.js).  You can add new easing
formulas by attaching methods to `Tweenable.formulas`.

## Using multiple easing formulas

Shifty supports tweens that have different easing formulas for each property.
Having multiple easing formulas on a single tween can make for some really
interesting animations, because you aren't constrained to moving things in a
straight line.  You can make curves!  To do this, simply supply `easing` as an
Object, rather than a string:

```javascript
tween({
  from: {
    x: 0,
    y: 0
  },
  to: {
    x: 250,
    y: 150
  },
  easing: {
    x: 'swingFromTo',
    y: 'bounce'
  }
});
```

The `interpolate` function also supports both string and object parameter types
for `easing`.

## Per-tween custom easing functions

You are not limited to attaching functions to `Tweenable.formulas`.  You can
also supply a custom easing function directly to `tween`:

```javascript
tween({
  from: {
    x: 0,
    y: 0
  },
  to: {
    x: 250,
    y: 150
  },
  easing: pos => Math.pow(pos, 3)
});
```

Or even an Object of mixed strings and functions:

```javascript
tween({
  from: {
    x: 0,
    y: 0
  },
  to: {
    x: 250,
    y: 150
  },
  easing: {
    x: pos => Math.pow(pos, 3),
    y: 'linear'
  }
});
```

## Developing Shifty

First, install the dependencies via npm like so:

```
npm install
```

Once those are installed, you can generate `dist/shifty.js` with:

```
npm run build
```

To run the tests in CLI:

```
npm test
```

To generate the documentation (`dist/doc`):

```
npm run doc
```

To start a development server:

```
npm start
```

Once that's running, you can run the tests at
http://localhost:9009/webpack-dev-server/ and view the documentation at
http://localhost:9009/dist/doc/.

## Loading Shifty

Shifty exposes a UMD module, so you can load it however you like:

```javascript
// ES6
import { tween } from 'shifty';
```

Or:

```javascript
// AMD
define(['shifty'], function(shifty){
  shifty.tween({ from: { x: 0 }, to: { x: 10 } });
});
```

Or even:

```javascript
// CommonJS
const shifty = require('shifty');

shifty.tween({ from: { x: 0 }, to: { x: 10 } });
```

## Contributors

Take a peek at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors.

Special thanks goes to [Thomas Fuchs](https://twitter.com/thomasfuchs):
Shifty's easing formulas and Bezier curve code was adapted from his awesome
[Scripty2](https://github.com/madrobby/scripty2) project.

## License

Shifty is distributed under the [MIT
license](http://opensource.org/licenses/MIT).  You are encouraged to use and
modify the code to suit your needs, as well as redistribute it.
