Shifty Round Extension
===

To use the `round` extension, include `shifty.round.js` on your page after `shifty.core.js`.  `shifty.round.js` is also included in the standard build for your convenience.

This extension rounds tweened property values for each step through an animation. For example, if at some point during an animation, the current value of property `x` is 4.6, this extension would round it up to 5.  If it was 4.3, it would be rounded down to 4.

The extension is disabled by default.  To enable it, call:

````javascript
Tweenable.enableRounding();
````

To disable it:

````javascript
Tweenable.disableRounding();
````

You can also check to see if it is currently enabled:

````javascript
Tweenable.isRoundingEnabled();
````
