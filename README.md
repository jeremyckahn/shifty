Shifty
===

Shifty is a tweening engine for JavaScript.  That's it.  Shifty is a low level tool that can be encapsulated by higher-level tools.  At the most basic level, it does:

  * Tweening of `Number`s.
  * Extensibility hooks for the tweening.

The Shifty core doesn't do:

  * Keyframing.
  * Drawing.
  * Much else.

If you need functionality like this and more, you can easily extend or wrap Shifty's core with whatever you need.  In fact, there are some extensions included in this repo to do just that.  Currently, there are Shifty extensions for:

  * `shifty.color.js`: Color tweening (RGB/Hex strings).
  * `shifty.px.js`: `px` strings (so you can tween DOM elements).
  * `shifty.queue.js`: Queuing tweens that execute sequentially.

There is also a file called `shifty.formulas.js` that contains a bunch of ready-to-use easing formulas.

Using Shifty
---

If you just want raw tweening functionality, all you need is `shifty.core.js`.  This is in the `src` directory.  Just drop that in your page, and you are ready to go.  

To use any Shifty extensions or additions, simply include them in the page after `shifty.core.js`.

API
===

The section explains how to use the Shifty core.  For information on each extension, explore the `doc/` directory.

__Makinging a `tweenable()` instance__

The first thing you need to do is create an instance of `Tweenable` and `init()` it.  Here's a one-liner example:

````javascript
var myTweenable = (new Tweenable()).init();
````

__Why do I make you call `init()`?__  Because I like to make you do mindless busy work.  More importantly, `Tweenable()` is meant to be inherited - properly, in context of JavaScript's prototypal inheritance model - and `Tweenable()` objects need to maintain individual state.  In plain English, they need their own properties that are not shared across instances.  In even plainer English, calling `init()` ensures that multiple `Tweenable()` instances do not share data that they shouldn't be sharing, and your stuff won't break mysteriously.

You can also supply some fun options to `init()`.  They are:

  * `fps`: This is the framerate (frames per second) at which the tween updates.  The default is `30`.
  * `easing`: The default easing formula to use on a tween.  This can be overridden on a per-tween basis via the `tween` function's `easing` parameter (see below).
  * `duration`: The default duration that a tween lasts for.  This can be overridden on a per-tween basis via the `tween` function's `duration` parameter (see below).

##Shifty core methods##

__Tweening:__

```javascript
var aTween = myTweenable.tween( from, to );
````

You can optionally add some fun extra parameters:

```javascript
var aTween = myTweenable.tween( from, to, duration, callback, easing );
````

Or you can use the configuration object syntax (recommended!):

````javascript
var tween = myTweenable.tween({
  from:       {  },            // Object.  Contains the properties to tween.  Note: This object's properties are modified by Tweenable(), internally.
  to:         {  },            // Object.  The "destination" `Number`s that the properties in `from` will tween to.
  duration:   1000,            // Number.  How long the tween lasts for, in milliseconds.
  easing:     'linear',        // String.  Easing equation to use.  "Linear" is the default.  You can specify any easing method that was attached to `Tweenable.prototype.formula`.
  step:       function () {},  // Function.  Runs each "frame" that the tween is updated.
  callback:   function () {}   // Function.  Runs when the tween completes.
});
````

This starts a tween.  You can use either format, but the second, longer format give you more hooks and controls.  The method returns an object that you can use to control a tween, as described in the next section.

__Important!__  The object that is passed as the `from` parameter, regardless of which syntax you use to invoke `tween()`, is modified.

##Controlling a tween##

Continuing from above...

````javascript
aTween.stop( gotoEnd );
````

Stops a tween.

  * `gotoEnd`: Boolean.  Controls whether to jump to the end "to" state or just stop where the tweened values currently are.

````javascript
aTween.pause();
````

Pauses a tween.  This is different from `stop()` as you are to resume from a `pause()`ed state.

````javascript
aTween.resume();
````

Resumes a `pause()`ed tween.

````javascript
aTween.get();
````

Returns a tween's current values.

##Extending Tweenable()##

Shifty's true power comes from it's extensibility.  Specifically, it is designed to be inherited, and to fit in easily to any prototypal inheritance chain.  A quick example of how to do that:

````javascript
function cartoon () {
	this.init();
	console.log('Whoop whoop!  This is my framerate: ' + this.fps);
}

cartoon.prototype = Tweenable();
var myCartoon = new cartoon();
````

This is awesome because any plugins or extensions that you are present on the `Tweenable()` prototype are also available to `myCartoon`, and all instances of `cartoon`.  That's fun, but how do we inject some useful functionality into `Tweenable` instances?

hooks
---

You can attach various hooks that get run at key points in a `Tweenable` instance's lifecycle.

````javascript
var myTweenable = (new Tweenable()).init();

/**
 * @param {String} hookName The `Tweenable` hook to attach the `hookFunction` to.
 * @param {Function} hookFunction The function to execute.
 */
tweenableInst.hookAdd( hookName, hookFunction )
````

You can attach as many functions as you please to any hook.  Here's an example: 

````javascript
function stepHook (state) {
	// Limit x to 300
	if (state.x > 300) {
		state.x = 300;
	}
}

myTweenable.hookAdd('step', stepHook);
````

This snippet will set the anonymous function supplied for `hookFunction` to be called every frame.  You can also remove hooks:

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

  * `step`:  Runs on every frame that a tween runs for.  Hook handler receives a tween's `currentState` for a parameter.

... And that's it.  They're easy to add in, please make Github issue or make a pull request if you'd like more to be added.

Filters
---

Filters are used for transforming the properties of a tween at various points in a `tweenable` instance's lifecycle.  Filters differ from hooks because they get executed for all `Tweenable` instances globally.  Just define a filter once, attach it to `Tweenable.prototype`, and all `new` instances of `Tweenable` will have access to it.

Here's an annotated example of a filter:

````javascript
Tweenable.prototype.filter.doubler = {
	// Gets called when a tween is created.  `fromState` is the state that the tween starts at, and `toState` contains the target values.
	'tweenCreated': function tweenCreated (fromState, toState) {
		Tweenable.util.each(obj, function (fromState, prop) {
			obj[prop] *= 2;
		});
	},
	
	// Gets called right before a tween state is calculated.
	// `currentState` is the current state of the tweened object, `fromState` is the state that the tween started at, and `toState` contains the target values.
	'beforeTween': function beforeTween (currentState, fromState, toState) {
		Tweenable.util.each(currentState, function (obj, prop) {
			obj[prop] *= 2;
		});
	},
	
	// Gets called right after a tween state is calculated.
	// `currentState` is the current state of the tweened object, `fromState` is the state that the tween started at, and `toState` contains the target values.
	'afterTween': function afterTween (currentState, fromState, toState) {
		Tweenable.util.each(currentState, function (obj, prop) {
			obj[prop] *= 2;
		});
	}
}
````

Yes, having `doubler` filter is useless.  A more practical use of filters is to add support for more data types.  __Remember, `Tweenable()` only supports `Numbers` out of the box__, but you can add support for strings, functions, or whatever else you might need.  The `px` and `color` extensions work by filtering string values into numbers before each tween step, and then back again after the tween step.