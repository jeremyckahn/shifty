Tweeny Actor Extension
===

To use Kapi-compatible actors, include `tweeny.actor.js` on your page after `tweeny.core.js`.  [Info on actors](http://jeremyckahn.github.com/kapi/extending.html#actors).

This documentation uses `circle` as an example actor.

##Making an actor tween-able##

````javascript
var actorInst = tweeny.actorInit(circle);
````

##Tweening an actor##

````javascript
actorInst.tween( from, to, duration, callback, easing );
````

All `tweeny.tween()` syntaxes are valid.  You can also use any Tweeny extensions with actors:

````javascript
actorInst.queue( from, to, duration, callback, easing );
````