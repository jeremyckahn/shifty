Shifty CSS Units Extension
===

Just load this extension after `shifty.core.js` and you're set.

The Shifty CSS Units extension lets you tween values given as CSS Unit strings with Shifty.  Like so:

````javascript
var fivePixels = '5px';
````

or

````javascript
var tenPercent = '10%';
````

This useful if you need to tween things that need values that are CSS Unit strings.  An example of this is HTML DOM elements.  You could use Shifty and this extension like so:

````javascript
var myTweenable = new Tweenable(),
		div = document.getElementById('myDiv');

myTweenable.tween({
	from: {
		'left': '0em'
	},
	to: {
		'left': '400em'
	},
	'step': function () {
		div.style.left = this.left;
	}
});
````
