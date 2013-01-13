# Shifty - A teeny tiny tweening engine in JavaScript

Shifty is a tweening engine for JavaScript.  It is a lightweight library meant
to be encapsulated by higher-level tools.  The core library provides:

  * Interpolation of `Number`s over time (tweening).
  * Extensibility hooks for key points in the tweening process.

This is useful for web developers because it is the minimum amount of
functionality needed to build customizable animations. Shifty is optimized to
run many times a second with minimal processing and memory overhead, which is
necessary for smooth animations.  The core Shifty library doesn't do:

  * CSS animation
  * Canvas rendering
  * Sequencing
  * Much else

But don't worry!  If you need functionality like this, you can easily extend
the core with whatever you need.  In fact, there are some extensions included
in this repo that make Shifty more useful for common animation needs.
Extensions included in the default build are:

  * `shifty.token.js`: String support.  Allows you to interpolate strings with
    mixed units and numbers, such as "25px" or "rgb(255, 0, 255)".
  * `shifty.interpolate.js`: Compute the midpoint between two values outside of
    an animation sequence (computes a single frame of an animation).
  * `shifty.formulas.js`: A bunch of [Robert Penner](http://robertpenner.com/)
    easing formulas adapted from
    [Scripty2](https://github.com/madrobby/scripty2).

## Using Shifty

Shifty has no dependencies, so you can just load
[/dist/shifty.min.js](https://github.com/jeremyckahn/shifty/blob/master/dist/shifty.min.js)
to start using it.  This file has all of the extensions described above baked
in.  If you only want the core `Number` tweening functionality
([shifty.core.js](https://github.com/jeremyckahn/shifty/blob/master/src/shifty.core.js)),
you can easily build that without any extensions (please see the "Building
Shifty" section in this README).

In other words, you can use whatever components you want.  Just make sure you
use the build script, don't just copy and paste the files inside the `/src`
directory.

## API

The section explains how to use the core Shifty APIs.  For information on each
extension, explore the `doc/` directory.

## Making a `tweenable()` instance

The first thing you need to do is create a `new` instance of `Tweenable`:

````javascript
var myTweenable = new Tweenable();
````

You can also supply some fun options to the constuctor via an Object:

````javascript
/**
 * - fps: This is the framerate (frames per second) at which the tween updates.
 * - easing: The default easing formula to use on a tween.  This can be
 *   overridden on a per-tween basis via the `tween` function's `easing`
 *   parameter (see below).
 * - initialState: The state at which the first tween should begin at.
 * @typedef {{
 *  fps: number,
 *  easing: string,
 *  initialState': Object
 * }}
 */
var tweenableConfig = {};

var myTweenable = new Tweenable(tweenableConfig);
````

## Starting a tween

### tween

Make a basic tween:

````javascript
/**
 * The property names and types in `from` and `to` must match.
 * @param {Object} from Position to start at.
 * @param {Object} to Position to end at.
 * @param {number=} duration How long to animate for.
 * @param {function=} callback Function to execute upon completion.
 * @param {string=} easing Easing formula name to use for tween.
 */
myTweenable.tween( from, to, duration, callback, easing );
````

This is the shorthand syntax.  You can also use the Configuration Object
syntax:

````javascript
/**
 * - from: Starting position.
 * - to: Ending position (signature must match `from`).
 * - duration: How long to animate for.
 * - easing: Easing formula name to use for tween.
 * - start: Function to execute when the tween begins (after the first tick).
 * - step: Function to execute every tick.
 * - callback: Function to execute upon completion.
 * @typedef {{
 *   from: Object,
 *   to: Object,
 *   duration: number=,
 *   easing: string=,
 *   start: Function=,
 *   step: Function=,
 *   callback: Function=
 * }}
 */
var tweenConfig = {};
myTweenable.tween( tweenConfig );
````

__Important!__  The object that is passed as the `from` parameter, regardless
of which syntax you use to invoke `tween`, is modified.

### to

Another handy way to tween is to use the `to`  method.  `to()` is nearly
identical to `tween()` - in fact, `to()` just wraps `tween()` internally.  The
only difference is that you can omit the `from` parameter.  `to()` simply
assumes that you want to tween from the `Tweenable` instance's current
position.  Like tween, the shorthand and longhand syntaxes are supported.
Shorthand:

````javascript
/**
 * @param {Object} to
 * @param {number=} duration
 * @param {function=} callback
 * @param {string=} easing
 */
myTweenable.to( to, duration, callback, easing );
````

Longhand:

````javascript
/**
 * @typedef {{
 *   to: Object,
 *   duration: number=,
 *   easing: string=,
 *   start: Function=,
 *   step: Function=,
 *   callback: Function=
 * }}
 */
var toConfig = {};
myTweenable.to( toConfig );
````

## Controlling a tween

Continuing from above...

````javascript
/**
 * @param {boolean} gotoEnd Controls whether to jump to the end "to" state or
 * just stop where the tweened values currently are.
 */
myTweenable.stop( gotoEnd );
````

Stops a tween.

````javascript
/**
 * Pauses a tween.  This is different from `stop()`, as you are able to resume
 * from a `pause`ed state.
 */
myTweenable.pause();
````


````javascript
/**
 * Resumes a `pause`ed tween.
 */
myTweenable.resume();
````

````javascript
/**
 * Returns a `Tweenable`'s current internal state value.
 * @return {Object}
 */
myTweenable.get();
````

````javascript
/**
 * Sets (and overwrites) the current internal state properties.
 * @param {Object} state Contains the properties that the state should have.
 * Any properties not present in this Object will be erased form the current
 * state.
 */
myTweenable.set(state);
````

## Using multiple easing formulas

You can create tweens that use different easing formulas for each property.
Having multiple easing formulas on a single tween can make for some really
interesting animations, because you aren't constrained to moving things in a
straight line.  You can make curves!  To do this, simply supply `easing` as an
Object, rather than a string to `tween()`:

````javascript
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
that accepts an `easing` parameter (on other words, you can use this with `to`
and the Interpolate extension).  Mix and match to make interesting new
animations.

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
  the state that the tween started at, and `toState` contains the target
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
whatever else you might need.  The `px` and `color` extensions work by
filtering string values into numbers before each tween step, and then back
again after the tween step.

Building Shifty
---

Shifty uses [nodejs](http://nodejs.org) and [Grunt](http://gruntjs.com/) for
the build system. Just do this to build the project on the command line:

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
  //...
});
```

Shifty can also be used on NodeJS:

```js
var Tweenable = require('./shifty');
//...
```


Contributors
---

Take a peek at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors, but
[@millermedeiros](https://github.com/millermedeiros) deserves particular
recogintion for his patches to make Shifty compatible with Node.


Shifty in Use
---

Shifty is in known to be use in the following projects/sites:

  * [Rekapi](https://github.com/jeremyckahn/rekapi).  Shifty is a core
    component of Rekapi, a higher-level tool that allows developers to easily
    create and manage complex animations.
  * [Galaxy Nexus Landing Page](http://www.google.com/nexus/).  Shifty was used
    to create animations bound to the browser's scroll event.
  * [Morf.js](https://github.com/joelambert/morf), by [Joe
    Lambert](https://github.com/joelambert).  Morf.js is a CSS3 Transition
    utility.  It lets you define your own easing formulas, but also take
    advantage of hardware acceleration provided by Webkit browsers.  Morf.js
    uses Shifty to calculate keyframe states.
  * [html-timeline](https://github.com/Instrument/html-timeline), by [Thomas
    Reynolds](https://github.com/tdreyno).  This project acts as a wrapper for
    Shifty that animates HTML elements as you scroll the page.  Written in
    CoffeeScript!
