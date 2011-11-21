/*global setTimeout:true, clearTimeout:true */

/**
Shifty Queue Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.2.0

Dependencies: shifty.core.js

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny and this extension, please consult the manual: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyQueue (global) {
  
  function iterateQueue (queue) {
    queue.shift();

    if (queue.length) {
      queue[0]();
    } else {
      queue.running = false;
    }
  }
  
  function getWrappedCallback (callback, queue) {
    return function () {
      callback();
      iterateQueue(queue);
    };
  }
  
  function tweenInit (context, from, to, duration, callback, easing) {
    // Duck typing!  This method infers some info from the parameters above to determine which method to call,
    // and what paramters to pass to it.
    return function () {
      if (to) {
        // Shorthand notation was used, call `tween`
        context.tween(from, to, duration, callback, easing);
      } else {
        // Longhand notation was used

        // Ensure that that `wrappedCallback` (from `queue`) gets passed along.
        from.callback = callback;

        if (from.from) {
          context.tween(from);
        } else {
          // `from` data was omitted, call `to`
          context.to(from);
        }
      }
    };
  }

  global.Tweenable.prototype.queue = function (from, to, duration, callback, easing) {
    var wrappedCallback;
      
    if (!this._tweenQueue) {
      this._tweenQueue = [];
    }

    // Make sure there is always an invokable callback
    callback = callback || from.callback || function () {};
    wrappedCallback = getWrappedCallback(callback, this._tweenQueue);
    this._tweenQueue.push(tweenInit(this, from, to, duration, wrappedCallback, easing));

    return this;
  };
  
  global.Tweenable.prototype.queueStart = function () {
    if (!this._tweenQueue.running && this._tweenQueue.length > 0) {
      this._tweenQueue[0]();
      this._tweenQueue.running = true;
    }
    
    return this;
  };

  global.Tweenable.prototype.queueShift = function () {
    this._tweenQueue.shift();
    return this;
  };
  
  global.Tweenable.prototype.queuePop = function () {
    this._tweenQueue.pop();
    return this;
  };

  global.Tweenable.prototype.queueEmpty = function () {
    this._tweenQueue.length = 0;
    return this;
  };

  global.Tweenable.prototype.queueLength = function () {
    return this._tweenQueue.length;
  };
  
}(this));
