/**
 * Shifty Queue Extension
 *
 * Sequentially queues tweens.
 */
;(function () {

  var noop = function () {};

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
    // and what parameters to pass to it.
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

  /**
   * Add a tween to the queue.
   * @param {Object|tweenConfig} from Starting position OR a `tweenConfig` Object instead of the rest of the formal parameters.
   * @param {Object=} to Ending position (parameters must match `from`).
   * @param {number=} duration How many milliseconds to animate for.
   * @param {Function=} callback Function to execute upon completion.
   * @param {Object|string=} easing Easing formula(s) name to use for the tween.
   * @return {Tweenable}
   */
  Tweenable.prototype.queue = function (from, to, duration, callback, easing) {
    var wrappedCallback;

    if (!this._tweenQueue) {
      this._tweenQueue = [];
    }

    // Make sure there is always an invokable callback
    callback = callback || from.callback || noop;
    wrappedCallback = getWrappedCallback(callback, this._tweenQueue);
    this._tweenQueue.push(tweenInit(this, from, to, duration, wrappedCallback, easing));

    return this;
  };

  /**
   * Starts a sequence of tweens.
   * @return {Tweenable}
   */
  Tweenable.prototype.queueStart = function () {
    if (!this._tweenQueue.running && this._tweenQueue.length > 0) {
      this._tweenQueue[0]();
      this._tweenQueue.running = true;
    }

    return this;
  };

  /**
   * Removes the next queued tween to be executed.
   * @return {Tweenable}
   */
  Tweenable.prototype.queueShift = function () {
    this._tweenQueue.shift();
    return this;
  };

  /**
   * Removes the tween at the end of the queue.
   * @return {Tweenable}
   */
  Tweenable.prototype.queuePop = function () {
    this._tweenQueue.pop();
    return this;
  };

  /**
   * Removes all tweens in the queue.
   * @return {Tweenable}
   */
  Tweenable.prototype.queueEmpty = function () {
    this._tweenQueue.length = 0;
    return this;
  };

  /**
   * Returns the number of tweens queued up.
   * @return {number}
   */
  Tweenable.prototype.queueLength = function () {
    return this._tweenQueue.length;
  };

}());
