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

  function tweenInit (context, config) {
    return function () {
      context.tween(config);
    };
  }

  /**
   * Add a tween to the queue.
   * @param {Object} config Accepts the same parameters as Tweenable#tween.
   * @return {Tweenable}
   */
  Tweenable.prototype.queue = function (config) {
    var wrappedCallback;

    if (!this._tweenQueue) {
      this._tweenQueue = [];
    }

    // Make sure there is always an invokable callback
    var callback = config.callback || noop;
    config.callback = getWrappedCallback(callback, this._tweenQueue);
    this._tweenQueue.push(tweenInit(this, config));

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
