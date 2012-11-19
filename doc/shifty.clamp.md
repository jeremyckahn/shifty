Shifty Clamp Extension
===

To use the Clamp functionality, include `shifty.clamp.js` on your page after `shifty.core.js`.  `shifty.clamp.js` is _not_ included in the standard Shifty build, but you can easily add it by tweaking the `build.sh` script.

Use case:  Sometimes, when generating a tween dynamically, you want "clamp" the outputted values.  This means you are constricting them to be within a certain range.

Example:  You create a tween in your code that happens to animate from `-3` to `5`, but you want to use the normalized output for something.  This means that the generated value must be between `0` and `1`, and never outside of that range.

The Clamp extension will take care of this for you.

Demo:

````javascript
var myTweenable = new Tweenable();

myTweenable.setClamp('test', 0, 1);

myTweenable.tween({
	from: {
		'test': -3
	},
	to: {
		'test': 5
	},
	'duration': 1000,
	'step': function () {
		console.log(this.test);
	},
	'callback': function () {
		console.log('Done!  Final value: ' + this.test);
		console.log(myTweenable.removeClamp('test'));
	}
});
````

The important thing to note is that the `from` and `to` values are __not__ modified, only the generated per-frame value.  This means you may have multiple repeated values and the beginning and the end of the tween.  The output is clamped, not the input.

For each clamp method, there is a static and instance version.  Each have the same effect, but the instance version only affects the instance upon which the method was called.  Static versions affect all instances of `Tweenable`, and all tweens, for that matter (if you were calculating a tween with the `interpolate` extension, for example).  If a clamp was set on a property by both the instance and static methods, only the instance version's clamp is respected.

API
---

__Instance method__: tweenableInst.setClamp( propertyName, bottomRange, topRange )

__Static method__: Tweenable.setClamp( propertyName, bottomRange, topRange )

  * `propertyName`: The name of the `from`/`to` to clamp.
  * `bottomRange`: The lowest amount the frame's value can be.  The value for `propertyName` will never be less than this.
  * `topRange`: The highest amount the frame's value can be.  The value for `propertyName` will never be more than this.

__Instance method__: tweenableInst.removeClamp( propertyName )

__Instance method__: Tweenable.removeClamp( propertyName )

  * `propertyName`: The name of the `from`/`to` to stop clamping.
