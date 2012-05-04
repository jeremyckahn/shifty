Shifty Token Extension
===

__[Example](http://jeremyckahn.github.com/shifty/examples/token.html)__

The Token extension allows Shifty to tween numbers inside of strings.  This is
nice because it allows you to animate CSS properties.  For example, you can do
this:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(45px)'},
  to: { transform: 'translateX(90xp)'},
  duration: 1000
});
````

...And `translateX(45)` will be tweened to `translateX(90)`.  To demonstrate:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(45px)'},
  to: { transform: 'translateX(90px)'},
  duration: 100,
  step: function () {
    console.log(this.transform);
  }
});
````

Will log something like this in the console:

````
translateX(60.3px)
translateX(76.05px)
translateX(90px)
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


Easing support
==

Easing works somewhat differently in the Token extension.  This is because some
CSS properties have multiple values in them, and you might want to have each
value tween with an independant easing formula.  A basic example:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(0px) translateY(0px)'},
  to: { transform:   'translateX(100px) translateY(100px)'},
  duration: 100,
  easing: { transform: 'easeInQuad' },
  step: function () {
    console.log(this.transform);
  }
});
````

Gives results like this:

````
translateX(11.560000000000002px) translateY(11.560000000000002px)
translateX(46.24000000000001px) translateY(46.24000000000001px)
translateX(100px) translateY(100px)
````

Note that the values for `translateX` and `translateY` are always the same for
each step of the tween, because they have the same start and end points and
both use the same easing formula.  But we can also do this:

````javascript
var tweenable = new Tweenable();
tweenable.tween({
  from: { transform: 'translateX(0px) translateY(0px)'},
  to: { transform:   'translateX(100px) translateY(100px)'},
  duration: 100,
  easing: { transform: 'easeInQuad bounce' },
  step: function () {
    console.log(this.transform);
  }
});
````

And get an output like this:

````
translateX(10.89px) translateY(82.355625px)
translateX(44.89000000000001px) translateY(86.73062500000002px)
translateX(100px) translateY(100px)
````

`translateX` and `translateY` are not in sync anymore, because we specified the
`easeInQuad` formula for `translateX` and `bounce` for `translateY`.  Mixing
and matching easing formulae can make for some interesting curves in your
animations.

The order of the space-separated easing formulas correspond the token values
they apply to.  If there are more token values than easing formulae, the last
easing formula listed is used.
