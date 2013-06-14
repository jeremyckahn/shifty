# Shifty - A teeny tiny tweening engine in JavaScript

Shifty is a tweening engine for JavaScript.  It is a lightweight library meant
to be encapsulated by higher-level tools.  The core library provides:

  * Interpolation of `Number`s over time (tweening).
  * Extensibility hooks for key points in the tweening process.

This is useful for web developers because it is the minimum amount of
functionality needed to build customizable animations. Shifty is optimized to
run many times a second with minimal processing and memory overhead, which is
important to achieve smooth animations.  The core Shifty library doesn't do:

  * CSS animation
  * Canvas rendering
  * Sequencing
  * Much else

But don't worry!  If you need functionality like this, you can easily extend
the core with whatever you need.  In fact, there are some extensions included
in this repo that make Shifty more useful for common animation needs.
Extensions included in the default build are:

  * [`shifty.token.js`](http://jeremyckahn.github.com/shifty/dist/doc/#token):
    String support.  Allows you to interpolate strings with mixed units and
    numbers, such as "25px" or "rgb(255, 0, 255)".
  * [`shifty.interpolate.js`](http://jeremyckahn.github.com/shifty/dist/doc/#interpolate):
    Compute the midpoint between two values outside of an animation sequence.
    In other words, compute a single frame of an animation.
  * `shifty.formulas.js`: A bunch of [Robert Penner](http://robertpenner.com/)
    easing formulas adapted from
    [Scripty2](https://github.com/madrobby/scripty2).

## Using Shifty

Shifty has no dependencies, so you can just load
[/dist/shifty.min.js](https://github.com/jeremyckahn/shifty/blob/master/dist/shifty.min.js)
to start using it.  This file has all of the extensions described above baked
in.  If you only want the core `number` tweening functionality
([shifty.core.js](https://github.com/jeremyckahn/shifty/blob/master/src/shifty.core.js)),
you can easily build that without any extensions (please see [Building
Shifty](#building-shifty)).

## Getting started

The section explains how to get started with Shifty.  For full documentation on
each API, please see [the
documentation](http://jeremyckahn.github.com/shifty/dist/doc/).

## Making a `tweenable()` instance

The first thing you need to do is create a `new` instance of `Tweenable`:

````javascript
var myTweenable = new Tweenable();
````

You can also supply some fun options to the constuctor via an Object:

  * fps (number): This is the framerate (frames per second) at which the tween
    updates (default is 60).
  * easing (string or Object): The default easing formula to use on a tween.
    This can be overridden on a per-tween basis via the `tween` function's
    `easing` parameter (see below).
  * initialState (Object): The state at which the first tween should begin at.

````javascript
var myTweenable = new Tweenable({
  fps: 30,
  easing: 'bounce',
  initialState: { x: 35, y: 50 }
});
````

## tween

Make a basic tween by specifying some options:

  * from (Object): Starting position.  Required.
  * to (Object): Ending position (signature must match `from`). Required.
  * duration (number): How long to animate for.
  * easing (string): Easing formula name to use for tween.
  * start (function): Function to execute when the tween begins (after the
    first tick).
  * step (function): Function to execute every tick.
  * callback (function): Function to execute upon completion.

````javascript
var myTweenable = new Tweenable(tweenableConfig);

myTweenable.tween({
  from: { x: 0, y: 50 },
  to: { x: 10, y: -30 },
  duration: 1500,
  easing: 'easeOutQuad',
  start: function () { console.log('Off I go!'); },
  callback: function () { console.log('And I\'m done!'); }
});
````

__Important!__  The object that is passed as the `from` parameter is modified.

## Advanced usage

You can control the state of a tween with the following methods:

````javascript
Tweenable.prototype.stop();
Tweenable.prototype.pause();
Tweenable.prototype.resume();
````

You can also examine modify the state of a `Tweenable`:

````javascript
Tweenable.prototype.get();
Tweenable.prototype.set();
````

These, as well as other methods, are detailed more in the [API
documentation](http://jeremyckahn.github.com/shifty/dist/doc/).

## Using multiple easing formulas

You can create tweens that use different easing formulas for each property.
Having multiple easing formulas on a single tween can make for some really
interesting animations, because you aren't constrained to moving things in a
straight line.  You can make curves!  To do this, simply supply `easing` as an
Object, rather than a string to `tween()`:

````javascript
var myTweenable = new Tweenable(tweenableConfig);

myTweenable.tween({
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
````

You can use an an Object to specify the easing to use in any `Tweenable` method
that accepts an `easing` parameter (on other words, you can use this with the
Interpolate extension).  Mix and match to make interesting new animations.

Filters
---

Filters are used for transforming the properties of a tween at various points
in a `Tweenable` instance's lifecycle.  Filters differ from hooks because they
get executed for all `Tweenable` instances globally.  Additionally, they are
meant to convert non-`Number` datatypes to `Number`s so they can be tweened,
and then back again. Just define a filter once, attach it to
`Tweenable.prototype`, and all `new` instances of `Tweenable` will have access
to it.

Here's an annotated example of a filter:

````javascript
Tweenable.prototype.filter.doubler = {
  // Gets called when a tween is created.  `fromState` is the state that the
  // tween starts at, and `toState` contains the target values.
  'tweenCreated': function tweenCreated (fromState, toState) {
    Tweenable.util.each(obj, function (fromState, prop) {
      // Double each initial state property value as soon as the tween is
      // created.
      obj[prop] *= 2;
    });
  },

  // Gets called right before a tween state is calculated.
  // `currentState` is the current state of the tweened object, `fromState` is
  // the state that the tween started at, and `toState` contains the target
  // values.
  'beforeTween': function beforeTween (currentState, fromState, toState) {
    Tweenable.util.each(toState, function (obj, prop) {
      // Double each target property right before the tween formula is applied.
      obj[prop] *= 2;
    });
  },

  // Gets called right after a tween state is calculated.
  // `currentState` is the current state of the tweened object, `fromState` is
  // the state that the tween started at, and `toState` contains the target
  // values.
  'afterTween': function afterTween (currentState, fromState, toState) {
    Tweenable.util.each(toState, function (obj, prop) {
      // Return the target properties back to their pre-doubled values.
      obj[prop] /= 2;
    });
  }
}
````

Yes, having `doubler` filter is useless.  A more practical use of filters is to
add support for more data types.  __Remember, `Tweenable` only supports
`Numbers` out of the box__, but you can add support for strings, functions, or
whatever else you might need.  The Token extension works by filtering string
values into numbers before each tween step, and then back again after the tween
step.

Building Shifty
---

Shifty uses [nodejs](http://nodejs.org) and [Grunt](http://gruntjs.com/) for
the build system. It also requires a handful of Node modules for the build
process.  Install the dependencies via npm like so:

````
$: npm install
````

Once those are installed, do this at the command line to build the project:

````
$: grunt build
````

The the default `build` task creates a binary with extensions needed by
[Rekapi](http://rekapi.com/).  This is a good general-use configuration.  You
can also create minimal binaries that only include the bare essentials for
Shifty to run:

````
$: grunt build-minimal
````

Note that a minimal build includes no tweening formulas.  You can customize and
add build targets in the `grunt.js` file.  You can also lint the code and run
the unit tests with the default Grunt task:

````
$: grunt
````

To generate the documentation:

````
$: grunt dox
````


AMD and NodeJS
---

If an AMD loader (eg. [RequireJS](http://requirejs.org/),
[Curl.js](https://github.com/unscriptable/curl)) is present on the page Shifty
won't generate any globals, so to use it you must list `"shifty"` as
a dependency.

```js
define(['lib/shifty'], function(Tweenable){
  //shifty was loaded and is ready to be used
  var myAwesomeTweenable = new Tweenable();
});
```

Shifty can also be used on NodeJS:

```js
var Tweenable = require('./shifty');
```


Contributors
---

Take a peek at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors, but
[@millermedeiros](https://github.com/millermedeiros) deserves particular
recogintion for his patches to make Shifty compatible with Node.
