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

To generate, live-update, and view the documentation in your browser:

```
npm run doc:live
```

To start a development server:

```
npm start
```

Once that's running, you can run the tests at http://localhost:9009/test/.

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
