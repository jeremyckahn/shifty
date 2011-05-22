Tweeny Queue Extension
===

To use queues, include `tweeny.queue.js` on your page after `tweeny.core.js`.

You can define a list of tweens to be executed sequentially as each one completes.  The first thing you need to do, before working with queues, is define the queue you are working with:

````javascript
// Changes which queue to use
tweeny.queueName( 'queueName' );
````

This is not required.  If you do not set a queue to work with, the `default` queue will be used.  Once a tween has begun, it is taken out of the queue.  _Tweens in the queue are tweens that have not yet been started._  Also important:

````javascript
// Omitting the parameter just returns the name of the current queue
tweeny.queueName();
````

To add a tween to the queue, do this:

````javascript
tweeny.queue( from, to, duration, callback, easing );
````

The function signature is identical to `tweeny.tween()`'s.  The longer syntax is also valid.  A few more important methods:

````javascript
// Removes the next queued tween to be executed
tweeny.queueShift();
````

````javascript
// Removes the tween at the end of the queue
tweeny.queueUnshift();
````

````javascript
// Removes all tweens in the queue
tweeny.queueEmpty();
````

````javascript
// Returns the number of tweens in the queue
tweeny.queueLength();
````