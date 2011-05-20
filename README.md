Tweeny
===

Tweeny is a tweening engine for JavaScript.  That's it.  Tweeny is meant to be a low level tool that can be encapsulated by higher-level tools.  It does:

  * Tweening.
  * Extensibility hooks for the tweening.

Tweeny doesn't do:

  * Keyframing.
  * Queuing.
  * Drawing.
  * Much else.

Possible API
---

`tweeny.tween( fromProps, toProps, duration, easingFormula );`

or...

````javascript
tweeny.tween({
  fromProps:  {  },
  toProps:    {  },
  duration:   1000,
  easing:     'linear',
  step:       function () {},
  complete:   function () {}
});
````