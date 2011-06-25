Shifty Interpolate Extension
===

To use the `interpolate` functions, include `shifty.interpolate.js` on your page after `shifty.core.js`.  `shifty.interpolate.js` is also included in `shifty.min.js` for your convenience.

The `interpolate` functions are handy utilities for calculating what tween values will be at specified points.  To put it another way, you can query the calculated values that `Tweenable` would be calculating for you anyways.  The difference is that you can control what point in the tween you want to sample the values from.

For historical reference, this extension was made in response to [Issue 3](https://github.com/jeremyckahn/shifty/issues/3), proposed by [@joelambert](https://github.com/joelambert).

The are actually two versions of the `interpolate` method:  Static and instance.  The static version can be accessed publicly via `Tweenable.util.interpolate`.  The instance version of `interpolated` is available as a method of all `Tweenable` instances.  They are pretty much the same, slight differences are documented below.

##Tweenable.util.interpolate##

````javascript
/**
 * @param {Object} from The starting values to tween from.
 * @param {Object} to The ending values to tween to.
 * @param {Number} position The normalized position value (between 0.0 and 1.0) to interpolate the values between `from` and `to` against.
 * @param {String} easing The easing method to calculate the interpolation against.  You can use any easing method attached to `Tweenable.prototype.formula`.  If omitted, this defaults to "linear".
 */
Tweenable.util.interpolate ( from, to, position, easing )
````

The alternative (but equivalent) function signature is:

````javascript
// Properties are identical to corresponding parameters above.
Tweenable.util.interpolate ({
	from: Object, 
	to: Object, 
	position: Number, 
	easing: String
})
````
Here's an example of the static method in action:

````javascript
var interpolatedValues = Tweenable.util.interpolate({
    width: '100px',
    opacity: 0,
    color: '#FFF'
}, {
    width: '200px',
    opacity: 1,
    color: '#000'
}, 0.5);

console.log(interpolatedValues);
````

This would log out the following Object:

````javascript
{ color: "rgb(127,127,127)",
	opacity: 0.5,
	width: "150px" }
````

Note:  This example assumes that the `px` and `color` extensions are available.