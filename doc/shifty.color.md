Shifty Color Extension
===

Tween colors to make awesome looking animations.  By default, Shifty only supports the tweening of `Number` properties of an Object, but this extension lets you tween color strings as well, enabling you to smoothly fade from any color to any other color.  A color string is either a hexadecimal value or an RGB value.

__Hexadecimal__

````javascript
Pink:

  #f0f
  #ff00ff
````

This extension supports both shorthand and long formats.

__RGB__

````javascript
Pink:

  rgb(255,0,255)
````

Keep in mind that whitespace is not allowed - this was a design choice when writing this extension, as stipping out the white space would require slightly more CPU cycles than not.  Also, all characters must be lowercase.

To use this awesome Shifty extension, just load after you load `shifty.core.js`.

Example usage:

````javascript
var myTweenable = new Tweenable();

myTweenable.tween({
	from: {
		'color': '#0f0'
	},
	to: {
		'color': '#f0f'
	}
});
````
