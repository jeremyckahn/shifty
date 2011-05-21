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

API
---

##Making a tween##

```javascript
var tween = tweeny.tween( from, to );
````

You can add some fun extra parameters:

```javascript
var tween = tweeny.tween( from, to, duration, callback, easing );
````

or...

````javascript
var tween = tweeny.tween({
  from:       {  },            // Object
  to:         {  },            // Object
  duration:   1000,            // Number
  easing:     'linear',        // String
  step:       function () {},  // Function
  callback:   function () {}   // Function
});
````

This starts a tween.  You can use either format, but the second, longer format give you more hooks and controls.  The method returns an object that you can use to control a tween, as described in the next section.

This method returns an object that you can use to interact with the tween, as outlined below.

__Important!__  The object that is passed as the `from` parameter, regardless of which syntax you use to invoke `tweeny.tween`, is modified.

##Controlling a tween##

Continuing from above...

````javascript
tween.stop( gotoEnd );
````

Stops a tween.

  * `gotoEnd`: Boolean.  Controls whether to jump to the end "to" state or just stop where the tweened values currently are.

````javascript
tween.get();
````

Returns a tween's current values.

##Queuing##

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