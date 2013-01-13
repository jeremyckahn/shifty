/*global module:true
 global define: true */
/**
 * Shifty Core
 * By Jeremy Kahn - jeremyckahn@gmail.com
 */

// Should be outside the following closure since it will be used by all
// modules.  It won't generate any globals after building.
var Tweenable;

// UglifyJS define hack.  Used for unit testing.
if (typeof SHIFTY_DEBUG_NOW === 'undefined') {
  SHIFTY_DEBUG_NOW = function () {
    return +new Date();
  };
}

(function (global) {

  'use strict';

  var DEFAULT_EASING = 'linear';
  var DEFAULT_DURATION = 500;
  var now = SHIFTY_DEBUG_NOW
      ? SHIFTY_DEBUG_NOW
      : function () { return +new Date(); };

  /**
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

  /**
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

  /**
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

  /**
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
      if (currentState.hasOwnProperty(prop)
          && targetState.hasOwnProperty(prop)) {
          currentState[prop] = tweenProp(originalState[prop],
              targetState[prop], formula[easing[prop]], normalizedPosition);
      }
    }

    return currentState;
  }

  /**
   * Tweens a single property.
   * @param {number} start The value that the tween started from.
   * @param {number} end The value that the tween should end at.
   * @param {Function} easingFunc The easing formula to apply to the tween.
   * @param {number} position The normalized position (between 0.0 and 1.0) to
   *    calculate the midpoint of 'start' and 'end' against.
   * @return {number} The tweened value.
   */
  function tweenProp (start, end, easingFunc, position) {
    return start + (end - start) * easingFunc(position);
  }

  /**
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

  /**
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
    var endTime = timestamp + duration;
    var currentTime = Math.min(now(), endTime);
    var isEnded = currentTime >= endTime;

    if (tweenable._isTweening) {
      if (!isEnded) {
        tweenable._loopId = setTimeout(function () {
          timeoutHandler(tweenable, timestamp, duration, currentState,
            originalState, targetState, easing, step);
        }, 1000 / tweenable.fps);
      }

      applyFilter(tweenable, 'beforeTween',
          [currentState, originalState, targetState, easing]);
      tweenProps(currentTime, currentState, originalState, targetState,
          duration, timestamp, easing);
      applyFilter(tweenable, 'afterTween',
          [currentState, originalState, targetState, easing]);

      if (step) {
        // TODO: This is silly.  Either pass the state as context or as a
        // formal parameter, not both.
        step.call(currentState, currentState);
      }
    }

    if (isEnded || !tweenable._isTweening) {
      tweenable.stop(true);
    }
  }


  /**
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
   * - fps: This is the framerate (frames per second) at which the tween
   *   updates.
   * - easing: The default easing formula to use on a tween.  This can be
   *   overridden on a per-tween basis via the `tween` function's `easing`
   *   parameter (see below).
   * - duration: The default duration that a tween lasts for.  This can be
   *   overridden on a per-tween basis via the `tween` function's `duration`
   *   parameter (see below).
   * - initialState: The state at which the first tween should begin at.
   * @typedef {{
   *  fps: number,
   *  easing: string,
   *  initialState': Object
   * }}
   */
  var tweenableConfig;

  /**
   * @param {tweenableConfig} options
   * @return {Object}
   */
  Tweenable = function (options) {
    options = options || {};

    this.data = {};

    // The state that the tween begins at.
    this._currentState = options.initialState || {};

    // The framerate at which Shifty updates.  This is exposed publicly as
    // `tweenableInst.fps`.
    this.fps = options.fps || 30;

    // The default easing formula.  This is exposed publicly as
    // `tweenableInst.easing`.
    this._easing = options.easing || DEFAULT_EASING;

    return this;
  };

  /**
   * - from: Starting position.
   * - to: Ending position (signature must match `from`).
   * - duration: How long to animate for.
   * - easing: Easing formula name to use for tween.
   * - start: Function to execute when the tween begins (after the first tick).
   * - step: Function to execute every tick.
   * - callback: Function to execute upon completion.
   * @typedef {{
   *   from: Object,
   *   to: Object,
   *   duration: number=,
   *   easing: string=,
   *   start: Function=,
   *   step: Function=,
   *   callback: Function=
   * }}
   */
  var tweenConfig;

  /**
   * TODO: Remove support for the shorthand form of calling this method.
   *
   * Start a tween.
   * @param {Object|tweenConfig} fromState
   * @param {Object=} targetState
   * @param {number=} duration
   * @param {Function=} callback
   * @param {Object|string=} easing
   * @return {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.tween =
      function (fromState, targetState, duration, callback, easing) {

    if (this._isTweening) {
      return;
    }

    this._loopId = 0;
    this._pausedAtTime = null;

    // Normalize some internal values depending on how this method was called
    if (arguments.length > 1) {
      // Assume the shorthand syntax is being used.
      this._targetState = targetState || {};
      this._duration = duration || DEFAULT_DURATION;
      this._callback = callback;
      this._easing = easing || DEFAULT_EASING;
      this._currentState = fromState || {};
    } else {
      // If the second argument is not present, assume the longhand syntax is
      // being used.
      var config = fromState;
      this._step = config.step;
      this._callback = config.callback;
      this._targetState = config.to || config.target || {};
      this._duration = config.duration || DEFAULT_DURATION;
      this._easing = config.easing || DEFAULT_EASING;
      this._currentState = config.from || {};
    }

    this._timestamp = now();

    var currentStateAlias = this._currentState;
    var targetStateAlias = this._targetState;

    // Ensure that there is always something to tween to.
    // Kinda dumb and wasteful, but makes this code way more flexible.
    defaults(currentStateAlias, targetStateAlias);
    defaults(targetStateAlias, currentStateAlias);

    this._easing = composeEasingObject(currentStateAlias, this._easing);
    var originalStateAlias = this._originalState =
        shallowCopy({}, currentStateAlias);
    applyFilter(this, 'tweenCreated', [currentStateAlias, originalStateAlias,
        targetStateAlias, this._easing]);
    this._isTweening = true;
    this.resume();

    if (fromState.start) {
      fromState.start();
    }

    return this;
  };

  /**
   * TODO: Remove this method and roll it into Tweenable#tween.
   *
   * Convenience method for tweening from the current position.  This method
   * functions identically to tween (it's just a wrapper function), but
   * implicitly passes the Tweenable instance's current state as the from
   * parameter.  This supports the same formats as tween, just omitting the
   * from paramter in both cases.
   * @param {Object} target If the other parameters are omitted, this Object
   *     should contain the longhand parameters outlined in `tween()`.  If at
   *     least one other formal parameter is specified, then this Object should
   *     contain the target values to tween to.
   * @param {Number} duration Duration of the tween, in milliseconds.
   * @param {Function} callback The callback function to pass along to
   *     `tween()`.
   * @param {String|Object} easing The easing formula to use.
   * @return {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.to = function to (target, duration, callback, easing) {
    if (arguments.length === 1) {
      if ('to' in target) {
        // Shorthand notation is being used
        target.from = this.get();
        this.tween(target);
      } else {
        this.tween(this.get(), target);
      }
    } else {
      // Longhand notation is being used
      this.tween(this.get(), target, duration, callback, easing);
    }

    return this;
  };

  /**
   * Returns the current state.
   * @return {Object}
   */
  Tweenable.prototype.get = function () {
    return shallowCopy({}, this._currentState);
  };

  /**
   * Force the `Tweenable` instance's current state.
   * @param {Object} state
   */
  Tweenable.prototype.set = function  (state) {
    this._currentState = state;
  };

  /**
   * Stops and cancels a tween.
   * @param {Boolean} gotoEnd If false, or omitted, the tween just stops at its
   * current state, and the callback is not invoked.  If true, the tweened
   * object's values are instantly set to the target values, and the `callback`
   * is invoked.
   * @return {Tweenable}
   */
  Tweenable.prototype.stop = function (gotoEnd) {
    clearTimeout(this._loopId);
    this._isTweening = false;

    if (gotoEnd) {
      shallowCopy(this._currentState, this._targetState);
      applyFilter(this, 'afterTweenEnd', [this._currentState,
          this._originalState, this._targetState, this._easing]);
      if (this._callback) {
        this._callback.call(this._currentState, this._currentState);
      }
    }

    // TODO: The start, step and callback hooks need to be nulled here, but
    // doing so will break the queue extension.  Restructure that extension so
    // that the tween can be cleaned up properly.

    return this;
  };

  /**
   * Pauses a tween.
   * @return {Tweenable}
   */
  Tweenable.prototype.pause = function () {
    clearTimeout(this._loopId);
    this._pausedAtTime = now();
    this._isPaused = true;
    return this;
  };

  /**
   * Resumes a paused tween.  A tween must be paused before is can be
   * resumed.
   * @return {Tweenable}
   */
  Tweenable.prototype.resume = function () {
    if (this._isPaused) {
      this._timestamp += now() - this._pausedAtTime;
    }

    timeoutHandler(this, this._timestamp, this._duration, this._currentState,
        this._originalState, this._targetState, this._easing, this._step);

    return this;
  };

  /**
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

  /**
   * This object contains all of the tweens available to Shifty.  It is
   * extendable - simply attach properties to the Tweenable.prototype.formula
   * Object following the same format at linear.
   */
  var formula = Tweenable.prototype.formula = {
    linear: function (pos) {
      return pos;
    }
  };

  // A hook used for unit testing.
  if (typeof SHIFTY_DEBUG_NOW === 'function') {
    global.timeoutHandler = timeoutHandler;
  }

  if (typeof exports === 'object') {
    // nodejs
    module.exports = Tweenable;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () { return Tweenable; });
  } else if (typeof global.Tweenable === 'undefined') {
    // Browser: Make `Tweenable` globally accessible.
    global.Tweenable = Tweenable;
  }

} (this));
