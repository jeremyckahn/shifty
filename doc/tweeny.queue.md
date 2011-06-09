Shifty Queue Extension
===

To use queues, include `shifty.queue.js` on your page after `shifty.core.js`.

You can define a list of tweens to be executed sequentially as each one completes.  This is useful if you have a number of tweens to perform on an Object, each one starting immediately as the previous one completes.

To queue up a tween, first make a `Tweenable()` instance:

````javascript
var myTweenable = (new Tweenable()).init();
````

And then call `queue()` on the instance to start tweening.  The API for `queue()` is identical to `tween()`, please consult the docs for that method if you need clarification.

````javascript
myTweenable.queue( from, to, duration, callback, easing );
````

The longer `tween()` syntax is also valid.  A few more important methods:

````javascript
// Removes the next queued tween to be executed
// Returns the `Tweenable()` instance for chainability
tweeny.queueShift();
````

````javascript
// Removes the tween at the end of the queue
// Returns the `Tweenable()` instance for chainability
tweeny.queuePop();
````

````javascript
// Removes all tweens in the queue
// Returns the `Tweenable()` instance for chainability
tweeny.queueEmpty();
````

````javascript
// Returns the `Number` of tweens in the queue
tweeny.queueLength();
````