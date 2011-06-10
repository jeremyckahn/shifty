Shifty Pixel Extension
===

Just load this extension after `shifty.core.js` and you're set.

The Shifty Pixel extension lets you tween values given as pixel strings with Shifty.  Like so:

````javascript
var fivePixels = '5px';
````

This useful if you need to tween things that need values that are pixel strings.  An example of this is browser DOM elements.  You could use Shifty and this extension like so:

````javascript
var myTweenable = (new Tweenable()).init(),
		div = document.getElementById('myDiv');

myTweenable.tween({
	from: {
		'left': '0px'
	},
	to: {
		'left': '400px'
	},
	'step': function () {
		div.style.left = this.left;
	}
});
````