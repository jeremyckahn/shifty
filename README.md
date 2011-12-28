Shifty - A teeny tiny tweening engine in JavaScript.
===

Shifty is a tweening engine for JavaScript.  That's it.  Shifty is a low-level library meant to be encapsulated by higher-level tools.  At the most basic level, it provides:

  * Tweening of `Number`s.
  * Extensibility hooks for the tweening.

Shifty is great because it focuses on doing one thing very well - tweening.  It is optimized to run many times a second with minimal processing and memory overhead, which is necessary for smooth animations.  To this end, the Shifty core doesn't do:

  * Keyframing.
  * Drawing.
  * Much else.

If you need functionality like this and more, you can easily extend or wrap Shifty's core with whatever you need.  In fact, there are some extensions included in this repo to do just that.  Currently, there are Shifty extensions for:

  * `shifty.color.js`: Color tweening (RGB/Hex strings).
  * `shifty.css_units.js`: CSS Unit strings ("px", "em", "%", etc.), so you can tween DOM elements.
  * `shifty.queue.js`: Queuing up tweens that execute sequentially.

There is also a file called `shifty.formulas.js` that contains a bunch of ready-to-use easing formulas, adapted from [Scripty2](https://github.com/madrobby/scripty2) and [Robert Penner](http://robertpenner.com/).

Using Shifty
---

Shifty has no dependencies, so you can just load [/dist/shifty.min.js](https://github.com/jeremyckahn/shifty/blob/master/dist/shifty.min.js) to start using it.  This file has all of the extensions baked in.  If you only need raw tweening functionality ([shifty.core.js](https://github.com/jeremyckahn/shifty/blob/master/src/shifty.core.js)), you can easily build that without the extensions (please see the "Building Shifty" section in this README).

In other words, you can use whatever components you want.  Just make sure you build it first, don't just copy and paste the files inside the `/src` directory.

API
===

The section explains how to use the Shifty core.  For information on each extension, explore the `doc/` directory.

__Making a `tweenable()` instance__

The first thing you need to do is create a `new` instance of `Tweenable`.  Example:

````javascript
var myTweenable = new Tweenable();
````

You can also supply some fun options to `init()` via an Object.  They are:

  * `fps`: A Number.  This is the framerate (frames per second) at which the tween animation updates.  The default is `30`.
  * `easing`: A String.  The default easing formula to use on a tween.  This can be overridden on a per-tween basis via the `tween` function's `easing` parameter (see below).  This value is `linear` by default.
  * `duration`: A Number.  The default duration that a tween lasts for.  This can be overridden on a per-tween basis via the `tween` function's `duration` parameter (see below).
  * `intialState`: An Object.  The state at which the first tween should begin at.

##Starting a tween##

__tween()__

Make a basic tween:

````javascript
myTweenable.tween( from, to );
````

You can optionally add some fun extra parameters:

````javascript
myTweenable.tween( from, to, duration, callback, easing );
````

The previous examples used the shorthand syntax.  You can also use the longhand configuration object syntax (recommended!):

````javascript
myTweenable.tween({
  from:       {  },            // Object.  Contains the properties to tween.  Must all be `Number`s.  Note: This object's properties are modified by the tween.
  to:         {  },            // Object.  The "destination" `Number`s that the properties in `from` will tween to.
  duration:   1000,            // Number.  How long the tween lasts for, in milliseconds.
  easing:     'linear',        // String or Object.  Easing equation(s) to use.  You can specify any easing method that was attached to `Tweenable.prototype.formula`.
  start:      function () {},  // Function.  Runs as soon as the tween begins.  Handy when used with the `queue` extension.
  step:       function () {},  // Function.  Runs each "frame" that the tween is updated.
  callback:   function () {}   // Function.  Runs when the tween completes.
});
````

This method starts a tween.  You can use either format, but the second, longer format give you more hooks and controls.  `Tweenable` also has some methods that you can use to control a tween, as described in the next section.

__Important!__  The object that is passed as the `from` parameter, regardless of which syntax you use to invoke `tween()`, is modified.

__to()__

Another handy way to tween is to use the `to`  method.  `to()` is nearly identical to `tween()` - in fact, `to()` just wraps `tween()` internally.  The only difference is that you can omit the `from` parameter.  `to()` simply assumes that you want to tween from the `Tweenable` instance's current position.  Like tween, the shorthand and longhand syntaxes are supported.  Shorthand:

````javascript
myTweenable.to( to );
````

````javascript
myTweenable.to( to, duration, callback, easing );
````

Longhand:

````javascript
myTweenable.to({
  to:         {  },            // Object.  The "destination" `Number`s that the properties in `from` will tween to.
  duration:   1000,            // Number.  How long the tween lasts for, in milliseconds.
  easing:     'linear',        // String or Object.  Easing equation to use.  You can specify any easing method that was attached to `Tweenable.prototype.formula`.
  start:      function () {},  // Function.  Runs as soon as the tween begins.
  step:       function () {},  // Function.  Runs each "frame" that the tween is updated.
  callback:   function () {}   // Function.  Runs when the tween completes.
});
````

However you call `to()`, the only required parameter is `to`.

And yes... I should probably come up with a better naming scheme, because even I'm confused by that.

##Controlling a tween##

Continuing from above...

````javascript
myTweenable.stop( gotoEnd );
````

Stops a tween.

  * `gotoEnd`: Boolean.  Controls whether to jump to the end "to" state or just stop where the tweened values currently are.

````javascript
myTweenable.pause();
````

Pauses a tween.  This is different from `stop()`, as you are to resume from a `pause()`ed state.

````javascript
myTweenable.resume();
````

Resumes a `pause()`ed tween.

````javascript
myTweenable.get();
````

Returns a `Tweenable`'s current internal state values.

````javascript
myTweenable.set(state);
````

Sets (and overwrites) the `Tweenable` instance's current internal state properties.

  * `state`: An Object containing the properties that the state should have.  Any properties not present in this Object will be erased form the current state.

##Using multiple easing formulas##

You can create tweens that use different easing formulas for each property.  Having multiple easing formulas on a single tween can make for some really interesting motions, because you arent constrained to moving things in a straight line.  You can make curves!  To do this, simply supply `easing` as an Object, rather than a string to `tween()`:

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

You can use an an Object to specify the easing to use in any `Tweenable` method that accepts an `easing` parameter (on other words, you can use this with `to` and the Interpolate extension).  Mix and match to make interesting new animations.

##Extending Tweenable()##

Shifty's true power comes from it's extensibility.  It is designed to be an inheritable, effective base Object.  A quick example of how to set that up:

````javascript
function Cartoon () {
  // Borrow `Tweenable`'s constructor
  this.constructor.call(this);
  console.log('Whoop whoop!  This is my framerate: ', this.fps);
}

// Set `Cartoon` to share `Tweenable`'s prototype
Cartoon.prototype = Tweenable.prototype;
var myCartoon = new Cartoon();
````

In this example, `Cartoon` is borrowing the prototype and constructor of `Tweeneable` to build the inheritance chain.  This is a more advanced approach, but it will likely give you the most flexibility and minimize bizarre "shared prototype" bugs.

Using inheritance is awesome because any plugins or extensions that are present on the `Tweenable()` prototype are also available to `myCartoon`, and all instances of `Cartoon` (and `Tweenable`).  You can define these inheritable functions by attaching them to the `Tweenable.prototype` Object.  A full example of this:

````javascript
// Add a new method to the `Tweenable` prototype
Tweenable.prototype.logMyProperties = function () {
  Tweenable.util.each(this, function (obj, prop) {
    console.log(prop + ': ', obj[prop]);
  });
}

// Define a constructor function
function Cartoon () {
  this.constructor.call(this);
  this.cartoonProp = "I am a property of Cartoon!  And not the Tweenable prototype!";
  console.log('Whoop whoop!  This is my framerate: ', this.fps);
}

Cartoon.prototype = Tweenable.prototype;

// Make a new instance of `cartoon`
var myCartoon = new Cartoon();

// Test the new prototype method
myCartoon.logMyProperties();
````

That's fun, but how do we hook functionality into `Tweenable` instances themselves?

Hooks
---

You can attach various hooks that get run at key points in a `Tweenable` instance's execution.  The API:

````javascript
/**
 * @param {String} hookName The `Tweenable` hook to attach the `hookFunction` to.
 * @param {Function} hookFunction The function to execute.
 */
tweenableInst.hookAdd( hookName, hookFunction )
````

You can attach as many functions as you please to any hook.  Here's an example:

````javascript
function limitX (state) {
  // Limit x to 300
  if (state.x > 300) {
    state.x = 300;
  }
}

var myTweenable = new Tweenable();

myTweenable.hookAdd('step', limitX);
````

This snippet will set the function `limitX` for `hookFunction` to be called every frame, after the values have been computed.  You can also remove hooks.  The API:

````javascript
/**
 * @param {String} hookName The `Tweenable` hook to remove the `hookFunction` from.
 * @param {Function|undefined} hookFunction The function to remove.  If omitted, all functions attached to `hookName` are removed.
 */
tweenableInst.hookRemove( hookName, hookFunction )
````

Example, continuing from above:

````javascript
myTweenable.hookRemove('step', stepHook);
````

The hooks you can currently attach functions to are:

  * `step`:  Runs on every frame that a tween runs for.  Hook handler function receives a tween's `currentState` for a parameter.

... And that's it.  They're easy to add in, please make Github issue or pull request if you'd like more to be added.

Filters
---

Filters are used for transforming the properties of a tween at various points in a `Tweenable` instance's lifecycle.  Filters differ from hooks because they get executed for all `Tweenable` instances globally.  Additionally, they are meant to convert non-`Number` datatypes to `Number`s so they can be tweened, and then back again. Just define a filter once, attach it to `Tweenable.prototype`, and all `new` instances of `Tweenable` will have access to it.

Here's an annotated example of a filter:

````javascript
Tweenable.prototype.filter.doubler = {
  // Gets called when a tween is created.  `fromState` is the state that the tween starts at, and `toState` contains the target values.
  'tweenCreated': function tweenCreated (fromState, toState) {
    Tweenable.util.each(obj, function (fromState, prop) {
      // Double each initial state property value as soon as the tween is created.
      obj[prop] *= 2;
    });
  },

  // Gets called right before a tween state is calculated.
  // `currentState` is the current state of the tweened object, `fromState` is the state that the tween started at, and `toState` contains the target values.
  'beforeTween': function beforeTween (currentState, fromState, toState) {
    Tweenable.util.each(toState, function (obj, prop) {
      // Double each target property right before the tween formula is applied.
      obj[prop] *= 2;
    });
  },

  // Gets called right after a tween state is calculated.
  // `currentState` is the current state of the tweened object, `fromState` is the state that the tween started at, and `toState` contains the target values.
  'afterTween': function afterTween (currentState, fromState, toState) {
    Tweenable.util.each(toState, function (obj, prop) {
      // Return the target properties back to their pre-doubled values.
      obj[prop] /= 2;
    });
  }
}
````

Yes, having `doubler` filter is useless.  A more practical use of filters is to add support for more data types.  __Remember, `Tweenable` only supports `Numbers` out of the box__, but you can add support for strings, functions, or whatever else you might need.  The `px` and `color` extensions work by filtering string values into numbers before each tween step, and then back again after the tween step.

Building Shifty
---

Shifty uses [nodejs](http://nodejs.org) for the build system. In the root
directory, there is a file called `build.js`. Just do this to build the
project on the command line:

```sh
node build
```

You can specify the modules that you want to include through the CLI.

```sh
node build -i formulas,color
```

Or modules that you want to exclude from the build:

```sh
node build -e css_units,interpolate,clamp
```

For more options check the help:

```sh
node build -h
```

All required files will be included automatically (such as `shifty.core.js`).
You can find a ready-to-use build of the project at `dist/shifty.min.js`. This
build includes the core and all extensions. Feel free to customize the build
for your own needs. Shifty uses [SemVer](http://semver.org/).


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
  ...
});
```

Shifty can also be used on NodeJS:

```js
var Tweenable = require('./shifty');
...
```


Contributors
---

Take a peek at the [Network](https://github.com/jeremyckahn/shifty/network)
page to see all of the Shifty contributors, but
[@millermedeiros](https://github.com/millermedeiros) deserves particular
recogintion for his patches to make Shifty compatible with Node and for
rewriting the build system.


Shifty in Use
---

Shifty is in known to be use in the following projects/sites:

  * [Rekapi](https://github.com/jeremyckahn/rekapi).  Shifty is a core component of Rekapi, a higher-level tool that allows developers to easily create and manage complex animations.
  * [Galaxy Nexus Landing Page](http://www.google.com/nexus/).  Shifty was used to create animations bound to the browser's scroll event.
  * [Morf.js](https://github.com/joelambert/morf), by [Joe Lambert](https://github.com/joelambert).  Morf.js is a CSS3 Transition utility.  It lets you define your own easing formulas, but also take advantage of hardware acceleration provided by Webkit browsers.  Morf.js uses Shifty to calculate keyframe states.
  * [html-timeline](https://github.com/Instrument/html-timeline), by [Thomas Reynolds](https://github.com/tdreyno).  This project acts as a wrapper for Shifty that animates HTML elements as you scroll the page.  Written in CoffeeScript!
