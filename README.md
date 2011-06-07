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