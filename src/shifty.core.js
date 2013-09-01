/*!
 * Shifty Core
 * By Jeremy Kahn - jeremyckahn@gmail.com
 */

// UglifyJS define hack.  Used for unit testing.  Contents of this if are
// compiled away.
if (typeof SHIFTY_DEBUG_NOW === 'undefined') {
  SHIFTY_DEBUG_NOW = function () {
    return +new Date();
  };
}

var Tweenable = (function () {

  'use strict';

  var DEFAULT_EASING = 'linear';
  var DEFAULT_DURATION = 500;
  var UPDATE_TIME = 1000 / 60;

  var _now = Date.now
      ? Date.now
      : function () { return +new Date(); };

  var now = SHIFTY_DEBUG_NOW
      ? SHIFTY_DEBUG_NOW
      : _now;

  var schedule = (function () {
    var updateMethod;

    if (typeof window !== 'undefined') {
      // requestAnimationFrame() shim by Paul Irish (modified for Shifty)
      // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      updateMethod = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || (window.mozCancelRequestAnimationFrame
            && window.mozRequestAnimationFrame)
        || setTimeout;
    } else {
      updateMethod = setTimeout;
    }

    return updateMethod;
  })();

  function noop () {
    // NOOP!
  }

  /*!
   * Handy shortcut for doing a for-in loop. This is not a "normal" each
   * function, it is optimized for Shifty.  The iterator function only receives
   * the property name, not the value.
   * @param {Object} obj
   * @param {Function(string)} fn
   */
  function each (obj, fn) {
    var key;
    for (key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        fn(key);
      }
    }
  }

  /*!
   * Perform a shallow copy of Object properties.
   * @param {Object} targetObject The object to copy into
   * @param {Object} srcObject The object to copy from
   * @return {Object} A reference to the augmented `targetObj` Object
   */
  function shallowCopy (targetObj, srcObj) {
    each(srcObj, function (prop) {
      targetObj[prop] = srcObj[prop];
    });

    return targetObj;
  }

  /*!
   * Copies each property from src onto target, but only if the property to
   * copy to target is undefined.
   * @param {Object} target Missing properties in this Object are filled in
   * @param {Object} src
   */
  function defaults (target, src) {
    each(src, function (prop) {
      if (typeof target[prop] === 'undefined') {
        target[prop] = src[prop];
      }
    });

    return target;
  }

  /*!
   * Calculates the interpolated tween values of an Object for a given
   * timestamp.
   * @param {Number} forPosition The position to compute the state for.
   * @param {Object} currentState Current state properties.
   * @param {Object} originalState: The original state properties the Object is
   * tweening from.
   * @param {Object} targetState: The destination state properties the Object
   * is tweening to.
   * @param {number} duration: The length of the tween in milliseconds.
   * @param {number} timestamp: The UNIX epoch time at which the tween began.
   * @param {Object} easing: This Object's keys must correspond to the keys in
   * targetState.
   */
  function tweenProps (forPosition, currentState, originalState, targetState,
      duration, timestamp, easing) {
    var normalizedPosition = (forPosition - timestamp) / duration;

    var prop;
    for (prop in currentState) {
      if (currentState.hasOwnProperty(prop)) {
          currentState[prop] = tweenProp(originalState[prop],
              targetState[prop], formula[easing[prop]], normalizedPosition);
      }
    }

    return currentState;
  }

  /*!
   * Tweens a single property.
   * @param {number} start The value that the tween started from.
   * @param {number} end The value that the tween should end at.
   * @param {Function} easingFunc The easing formula to apply to the tween.
   * @param {number} position The normalized position (between 0.0 and 1.0) to
   * calculate the midpoint of 'start' and 'end' against.
   * @return {number} The tweened value.
   */
  function tweenProp (start, end, easingFunc, position) {
    return start + (end - start) * easingFunc(position);
  }

  /*!
   * Applies a filter to Tweenable instance.
   * @param {Tweenable} tweenable The `Tweenable` instance to call the filter
   * upon.
   * @param {String} filterName The name of the filter to apply.
   * @param {Array} args The arguments to pass to the function in the specified
   * filter.
   */
  function applyFilter (tweenable, filterName, args) {
    var filters = Tweenable.prototype.filter;
    each(filters, function (name) {
      if (filters[name][filterName]) {
        filters[name][filterName].apply(tweenable, args);
      }
    });
  }

  var timeoutHandler_filterList = [];
  var timeoutHandler_endTime;
  var timeoutHandler_currentTime;
  var timeoutHandler_isEnded;
  /*!
   * Handles the update logic for one step of a tween.
   * @param {Tweenable} tweenable
   * @param {number} timestamp
   * @param {number} duration
   * @param {Object} currentState
   * @param {Object} originalState
   * @param {Object} targetState
   * @param {Object} easing
   * @param {Function} step
   */
  function timeoutHandler (tweenable, timestamp, duration, currentState,
      originalState, targetState, easing, step) {
    timeoutHandler_endTime = timestamp + duration;
    timeoutHandler_currentTime = Math.min(now(), timeoutHandler_endTime);
    timeoutHandler_isEnded = timeoutHandler_currentTime >= timeoutHandler_endTime;

    if (tweenable.isPlaying() && !timeoutHandler_isEnded) {
      schedule(tweenable._timeoutHandler, UPDATE_TIME);

      timeoutHandler_filterList.length = 0;
      timeoutHandler_filterList.push(currentState);
      timeoutHandler_filterList.push(originalState);
      timeoutHandler_filterList.push(targetState);
      timeoutHandler_filterList.push(easing);

      applyFilter(tweenable, 'beforeTween', timeoutHandler_filterList);
      tweenProps(timeoutHandler_currentTime, currentState, originalState,
          targetState, duration, timestamp, easing);
      applyFilter(tweenable, 'afterTween', timeoutHandler_filterList);

      step(currentState);
    } else if (timeoutHandler_isEnded) {
      step(targetState);
      tweenable.stop(true);
    }

  }


  /*!
   * Creates a fully-usable easing Object from either a string or another
   * easing Object.  If `easing` is an Object, then this function clones it and
   * fills in the missing properties with "linear".
   * @param {Object} fromTweenParams
   * @param {Object|string} easing
   */
  function composeEasingObject (fromTweenParams, easing) {
    var composedEasing = {};

    if (typeof easing === 'string') {
      each(fromTweenParams, function (prop) {
        composedEasing[prop] = easing;
      });
    } else {
      each(fromTweenParams, function (prop) {
        if (!composedEasing[prop]) {
          composedEasing[prop] = easing[prop] || DEFAULT_EASING;
        }
      });
    }

    return composedEasing;
  }

  /**
   * Tweenable constructor.  Valid parameters for `options` are:
   *
   * - __initialState__ (_Object_): The state at which the first tween should begin at.
   * @param {Object=} opt_options Configuration Object.
   * @constructor
   */
   function Tweenable (opt_options) {
    var options = opt_options || {};

    this.data = {};

    // The state that the tween begins at.
    this._currentState = options.initialState || {};

    this._timeoutHandler = null;

    return this;
  }

  /**
   * Start a tween.  `config` may have the following options (required parameters are noted):
   *
   * - __to__ (_Object_): Ending position (parameters must match `from`).  Required.
   * - __from__ (_Object=_): Starting position.  If omitted, the last computed state is used.
   * - __duration__ (_number=_): How many milliseconds to animate for.
   * - __step__ (_Function(Object)=_): Function to execute every tick.  Receives the state of the tween as the first parameter.  This function is not called on the final step of the animation, but `callback` is.
   * - __callback__ (_Function=_): Function to execute upon completion.
   * - __easing__ (_Object|string=_): Easing formula name(s) to use for the tween.
   *
   * @param {Object} config
   * @return {Tweenable}
   */
  Tweenable.prototype.tween = function (config) {

    // TODO: Rename "callback" to something like "finish."
    if (this._isTweening) {
      return;
    }

    this._pausedAtTime = null;

    this._step = config.step || noop;
    this._callback = config.callback || noop;
    this._targetState = config.to || {};
    this._duration = config.duration || DEFAULT_DURATION;
    this._currentState = config.from || this.get();

    this._timestamp = now();

    var currentState = this._currentState;
    var targetState = this._targetState;

    // Ensure that there is always something to tween to.
    // Kinda dumb and wasteful, but makes this code way more flexible.
    defaults(currentState, targetState);
    defaults(targetState, currentState);

    this._easing = composeEasingObject(
        currentState, config.easing || DEFAULT_EASING);
    var originalState = this._originalState = shallowCopy({}, currentState);
    applyFilter(this, 'tweenCreated',
        [currentState, originalState, targetState, this._easing]);

    return this.resume();
  };

  /**
   * Sets the current state.
   * @return {Object}
   */
  Tweenable.prototype.get = function () {
    return shallowCopy({}, this._currentState);
  };

  /**
   * Sets the current state.
   * @param {Object} state
   */
  Tweenable.prototype.set = function (state) {
    this._currentState = state;
  };

  /**
   * Stops and cancels a tween.
   * @param {boolean=} gotoEnd If false or omitted, the tween just stops at its current state, and the callback is not invoked.  If true, the tweened object's values are instantly set to the target values, and the `callback` is invoked.
   * @return {Tweenable}
   */
  Tweenable.prototype.stop = function (gotoEnd) {
    this._isTweening = false;
    this._isPaused = false;
    this._timeoutHandler = null;

    if (gotoEnd) {
      shallowCopy(this._currentState, this._targetState);
      applyFilter(this, 'afterTweenEnd', [this._currentState,
          this._originalState, this._targetState, this._easing]);
      this._callback.call(this._currentState, this._currentState);
    }

    // TODO: The start, step and callback hooks need to be nulled here, but
    // doing so will break the queue extension.  Restructure that extension so
    // that the tween can be cleaned up properly.

    return this;
  };

  /**
   * Pauses a tween.  Paused tweens can be resumed from the point at which they were paused.  This is different than `stop()`, as that method causes a tween to start over when it is resumed.
   * @return {Tweenable}
   */
  Tweenable.prototype.pause = function () {
    this._pausedAtTime = now();
    this._isPaused = true;
    return this;
  };

  /**
   * Resumes a paused tween.
   * @return {Tweenable}
   */
  Tweenable.prototype.resume = function () {
    if (this._isPaused) {
      this._timestamp += now() - this._pausedAtTime;
    }

    this._isPaused = false;
    this._isTweening = true;

    var self = this;
    this._timeoutHandler = function () {
      timeoutHandler(self, self._timestamp, self._duration, self._currentState,
          self._originalState, self._targetState, self._easing, self._step);
    };

    this._timeoutHandler();

    return this;
  };

  /**
   * Returns whether or not a tween is running.
   * @return {boolean}
   */
  Tweenable.prototype.isPlaying = function () {
    return this._isTweening && !this._isPaused;
  };

  /*!
   * Filters are used for transforming the properties of a tween at various
   * points in a Tweenable's lifecycle.  Please consult the README for more
   * info on this.
   */
  Tweenable.prototype.filter = {};

  shallowCopy(Tweenable, {
    'now': now
    ,'each': each
    ,'tweenProps': tweenProps
    ,'tweenProp': tweenProp
    ,'applyFilter': applyFilter
    ,'shallowCopy': shallowCopy
    ,'defaults': defaults
    ,'composeEasingObject': composeEasingObject
  });

  /*!
   * This object contains all of the tweens available to Shifty.  It is extendable - simply attach properties to the Tweenable.prototype.formula Object following the same format at linear.
   */
  Tweenable.prototype.formula = {
    linear: function (pos) {
      return pos;
    }
  };

  var formula = Tweenable.prototype.formula;

  // A hook used for unit testing.
  if (typeof SHIFTY_DEBUG_NOW === 'function') {
    root.timeoutHandler = timeoutHandler;
  }

  if (typeof exports === 'object') {
    // nodejs
    module.exports = Tweenable;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () { return Tweenable; });
  } else if (typeof root.Tweenable === 'undefined') {
    // Browser: Make `Tweenable` globally accessible.
    root.Tweenable = Tweenable;
  }

  return Tweenable;

} ());
