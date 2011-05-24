Tweeny Actor Extension
===

To use Kapi-compatible actors, include `tweeny.actor.js` on your page after `tweeny.core.js`.  [Info on actors](http://jeremyckahn.github.com/kapi/extending.html#actors).

##Creating a tween-able actor##

````javascript
// @param {Object|Function} `actorTemplate` A Kapi-style actor template
// @param {Object} `context` An HTML 5 canvas object context
var actorInst = tweeny.actorCreate(actorTemplate, context);
````

`tweeny.actorCreate()` also calls the actor's `setup` method, if there is one.

##Controlling an actor's `draw` behavior##

A Kapi actor works by calling its `draw` method each frame.  This is what draws the actor to the canvas.

````javascript
// Starts drawing actor to the canvas each frame.
// This rate is controlled by the `tweeny.fps` Number property.
actorInst.begin();
````

````javascript
// Stops the repeated call to the actor's `draw` function.
actorInst.stop();
````

##Removing an actor##

````javascript
// Removes the actor and calls its `destroy` method, if there is one.
actorInst.destroy();
````

##Tweening an actor##

````javascript
actorInst.tween( from, to, duration, callback, easing );
````

All `tweeny.tween()` syntaxes are valid.