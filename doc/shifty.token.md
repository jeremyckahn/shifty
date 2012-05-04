Shifty Token Extension
===

The Token extension allows Shifty to tween numbers inside of strings.  This is
nice because it allows you to animate CSS properties.  For example, you can do
this:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(45)'},
  to: { transform: 'translateX(90)'},
  duration: 1000
});
````

...And `translateX(45)` will be tweened to `translateX(90)`.  To demonstrate:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(45)'},
  to: { transform: 'translateX(90)'},
  duration: 100,
  step: function () {
    console.log(this.transform);
  }
});
````

Will log something like this in the console:

````
translateX(60.3)
translateX(76.05)
translateX(90)
````

Another use for this is animating colors:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { color: 'rgb(0,255,0)'},
  to: { color: 'rgb(255,0,255)'},
  duration: 100,
  step: function () {
    console.log(this.color);
  }
});
````

Logs something like:

````
rgb(84,170,84)
rgb(170,84,170)
rgb(255,0,255)
````

This extension also supports hex colors, in both long (`#ff00ff`) and short
(`#f0f`) forms.  Note that the extension converts hex input to the equivalent
RGB output values.  This is done to optimize for performance.

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { color: '#0f0'},
  to: { color: '#f0f'},
  duration: 100,
  step: function () {
    console.log(this.color);
  }
});
````

Yields:

````
rgb(84,170,84)
rgb(170,84,170)
rgb(255,0,255)
````

Same as before.
