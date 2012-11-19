/** @license
 * Shifty <http://jeremyckahn.github.com/shifty/>
 * Description: A teeny tiny tweening engine in JavaScript. That's all it does.
 * Author: Jeremy Kahn - jeremyckahn@gmail.com
 * License: MIT
 * Version: 0.8.0 (Mon, 19 Nov 2012 23:10:45 GMT)
 */

;(function(){

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

/**
 * Shifty Easing Formulas
 * Adapted for Shifty by Jeremy Kahn - jeremyckahn@gmail.com
 *
 * All equations are adapted from Thomas Fuchs' Scripty2:
 * https://raw.github.com/madrobby/scripty2/master/src/effects/transitions/penner.js
 * Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
 * (http://www.robertpenner.com/). This work is subject to the terms in
 * http://www.robertpenner.com/easing_terms_of_use.html
 *
 */

;(function () {

  Tweenable.shallowCopy(Tweenable.prototype.formula, {
    easeInQuad: function(pos){
       return Math.pow(pos, 2);
    },

    easeOutQuad: function(pos){
      return -(Math.pow((pos-1), 2) -1);
    },

    easeInOutQuad: function(pos){
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
      return -0.5 * ((pos-=2)*pos - 2);
    },

    easeInCubic: function(pos){
      return Math.pow(pos, 3);
    },

    easeOutCubic: function(pos){
      return (Math.pow((pos-1), 3) +1);
    },

    easeInOutCubic: function(pos){
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
      return 0.5 * (Math.pow((pos-2),3) + 2);
    },

    easeInQuart: function(pos){
      return Math.pow(pos, 4);
    },

    easeOutQuart: function(pos){
      return -(Math.pow((pos-1), 4) -1)
    },

    easeInOutQuart: function(pos){
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
      return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    },

    easeInQuint: function(pos){
      return Math.pow(pos, 5);
    },

    easeOutQuint: function(pos){
      return (Math.pow((pos-1), 5) +1);
    },

    easeInOutQuint: function(pos){
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
      return 0.5 * (Math.pow((pos-2),5) + 2);
    },

    easeInSine: function(pos){
      return -Math.cos(pos * (Math.PI/2)) + 1;
    },

    easeOutSine: function(pos){
      return Math.sin(pos * (Math.PI/2));
    },

    easeInOutSine: function(pos){
      return (-.5 * (Math.cos(Math.PI*pos) -1));
    },

    easeInExpo: function(pos){
      return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
    },

    easeOutExpo: function(pos){
      return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
    },

    easeInOutExpo: function(pos){
      if(pos==0) return 0;
      if(pos==1) return 1;
      if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
      return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
    },

    easeInCirc: function(pos){
      return -(Math.sqrt(1 - (pos*pos)) - 1);
    },

    easeOutCirc: function(pos){
      return Math.sqrt(1 - Math.pow((pos-1), 2))
    },

    easeInOutCirc: function(pos){
      if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
      return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
    },

    easeOutBounce: function(pos){
      if ((pos) < (1/2.75)) {
      return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
      return (7.5625*(pos-=(1.5/2.75))*pos + .75);
      } else if (pos < (2.5/2.75)) {
      return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
      } else {
      return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
      }
    },

    easeInBack: function(pos){
      var s = 1.70158;
      return (pos)*pos*((s+1)*pos - s);
    },

    easeOutBack: function(pos){
      var s = 1.70158;
      return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
    },

    easeInOutBack: function(pos){
      var s = 1.70158;
      if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
      return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
    },

    elastic: function(pos) {
      return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
    },

    swingFromTo: function(pos) {
      var s = 1.70158;
      return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
      0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
    },

    swingFrom: function(pos) {
      var s = 1.70158;
      return pos*pos*((s+1)*pos - s);
    },

    swingTo: function(pos) {
      var s = 1.70158;
      return (pos-=1)*pos*((s+1)*pos + s) + 1;
    },

    bounce: function(pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + .75);
      } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
      } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
      }
    },

    bouncePast: function(pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return 2 - (7.5625*(pos-=(1.5/2.75))*pos + .75);
      } else if (pos < (2.5/2.75)) {
        return 2 - (7.5625*(pos-=(2.25/2.75))*pos + .9375);
      } else {
        return 2 - (7.5625*(pos-=(2.625/2.75))*pos + .984375);
      }
    },

    easeFromTo: function(pos) {
      if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
      return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    },

    easeFrom: function(pos) {
      return Math.pow(pos,4);
    },

    easeTo: function(pos) {
      return Math.pow(pos,0.25);
    }
  });

}());

/**
 * Shifty Interpolate Extension
 * By Jeremy Kahn - jeremyckahn@gmail.com
 *
 * Enables Shifty to compute single midpoints of a tween.
 */
;(function () {

  function getInterpolatedValues (
      from, current, targetState, position, easing) {
    return Tweenable.tweenProps(
        position, current, from, targetState, 1, 0, easing);
  }


  function expandEasingParam (stateObject, easingParam) {
    var easingObject = easingParam;

    if (typeof easingParam === 'string') {
      easingObject = {};
      Tweenable.each(stateObject, function (prop) {
        easingObject[prop] = stateObject[prop];
      });
    }

    return easingObject;
  }


  // This is the static utility version of the function.
  Tweenable.interpolate = function (from, targetState, position, easing) {
    var current
        ,interpolatedValues
        ,mockTweenable;

    // Function was passed a configuration object, extract the values
    if (from && from.from) {
      targetState = from.to;
      position = from.position;
      easing = from.easing;
      from = from.from;
    }

    mockTweenable = new Tweenable();
    mockTweenable.easing = easing || 'linear';
    current = Tweenable.shallowCopy({}, from);
    var easingObject = Tweenable.composeEasingObject(
        from, mockTweenable.easing);

    // Call any data type filters
    Tweenable.applyFilter(mockTweenable, 'tweenCreated',
        [current, from, targetState, easingObject]);
    Tweenable.applyFilter(mockTweenable, 'beforeTween',
        [current, from, targetState, easingObject]);
    interpolatedValues = getInterpolatedValues(
        from, current, targetState, position, easingObject);
    Tweenable.applyFilter(mockTweenable, 'afterTween',
        [interpolatedValues, from, targetState, easingObject]);

    return interpolatedValues;
  };


  // This is the inheritable instance-method version of the function.
  Tweenable.prototype.interpolate = function (targetState, position, easing) {
    var interpolatedValues;

    interpolatedValues =
        Tweenable.interpolate(this.get(), targetState, position, easing);
    this.set(interpolatedValues);

    return interpolatedValues;
  };

}());

/**
 * Shifty Token Extension
 * By Jeremy Kahn - jeremyckahn@gmail.com
 *
 * Adds string support to Shifty.
 */
;(function (Tweenable) {

  /**
   * @typedef {{
   *   formatString: string
   *   chunkNames: Array.<string>
   * }}
   */
  var formatManifest;


  // CONSTANTS

  var R_FORMAT_CHUNKS = /([^-0-9\.]+)/g;
  var R_UNFORMATTED_VALUES = /[0-9.-]+/g;
  var R_RGB = new RegExp('rgb\\('
      + R_UNFORMATTED_VALUES.source + ',\s*' + R_UNFORMATTED_VALUES.source
      + ',\s*' + R_UNFORMATTED_VALUES.source + '\\)', 'g');
  var R_RGB_PREFIX = /^.*\(/;
  var R_HEX = /#([0-9]|[a-f]){3,6}/g;
  var VALUE_PLACEHOLDER = 'VAL';


  // HELPERS

  /**
   * @param {Array.number} rawValues
   * @param {string} prefix
   *
   * @return {Array.<string>}
   */
  function getFormatChunksFrom (rawValues, prefix) {
    var rawValuesLength = rawValues.length;
    var i, chunkAccumulator = [];

    for (i = 0; i < rawValuesLength; i++) {
      chunkAccumulator.push('_' + prefix + '_' + i);
    }

    return chunkAccumulator;
  }


  /**
   * @param {string} formattedString
   *
   * @return {string}
   */
  function getFormatStringFrom (formattedString) {
    var chunks = formattedString.match(R_FORMAT_CHUNKS)

    if (chunks.length === 1) {
      chunks.unshift('');
    }

    return chunks.join(VALUE_PLACEHOLDER);
  }


  /**
   * Convert all hex color values within a string to an rgb string.
   *
   * @param {Object} stateObject
   *
   * @return {Object} The modified obj
   */
  function sanitizeObjectForHexProps (stateObject) {
    Tweenable.each(stateObject, function (prop) {
      var currentProp = stateObject[prop];

      if (typeof currentProp === 'string' && currentProp.match(R_HEX)) {
        stateObject[prop] = sanitizeHexChunksToRGB(currentProp);
      }
    });
  }


  /**
   * @param {string} str
   *
   * @return {string}
   */
  function  sanitizeHexChunksToRGB (str) {
    return filterStringChunks(R_HEX, str, convertHexToRGB);
  }


  /**
   * @param {string} hexString
   *
   * @return {string}
   */
  function convertHexToRGB (hexString) {
    var rgbArr = hexToRGBArray(hexString);
    return 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
  }


  /**
   * Convert a hexadecimal string to an array with three items, one each for
   * the red, blue, and green decimal values.
   *
   * @param {string} hex A hexadecimal string.
   *
   * @returns {Array.<number>} The converted Array of RGB values if `hex` is a
   * valid string, or an Array of three 0's.
   */
  function hexToRGBArray (hex) {

    hex = hex.replace(/#/, '');

    // If the string is a shorthand three digit hex notation, normalize it to
    // the standard six digit notation
    if (hex.length === 3) {
      hex = hex.split('');
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    return [hexToDec(hex.substr(0, 2)), hexToDec(hex.substr(2, 2)),
           hexToDec(hex.substr(4, 2))];
  }


  /**
   * Convert a base-16 number to base-10.
   *
   * @param {Number|String} hex The value to convert
   *
   * @returns {Number} The base-10 equivalent of `hex`.
   */
  function hexToDec (hex) {
    return parseInt(hex, 16);
  }


  /**
   * Runs a filter operation on all chunks of a string that match a RegExp
   *
   * @param {RegExp} pattern
   * @param {string} unfilteredString
   * @param {function(string)} filter
   *
   * @return {string}
   */
  function filterStringChunks (pattern, unfilteredString, filter) {
    var pattenMatches = unfilteredString.match(pattern);
    var filteredString = unfilteredString.replace(pattern, VALUE_PLACEHOLDER);

    if (pattenMatches) {
      var pattenMatchesLength = pattenMatches.length;
      var currentChunk;

      for (var i = 0; i < pattenMatchesLength; i++) {
        currentChunk = pattenMatches.shift();
        filteredString = filteredString.replace(
            VALUE_PLACEHOLDER, filter(currentChunk));
      }
    }

    return filteredString;
  }


  /**
   * Check for floating point values within rgb strings and rounds them.
   *
   * @param {string} formattedString
   *
   * @return {string}
   */
  function sanitizeRGBChunks (formattedString) {
    return filterStringChunks(R_RGB, formattedString, sanitizeRGBChunk);
  }


  /**
   * @param {string} rgbChunk
   *
   * @return {string}
   */
  function sanitizeRGBChunk (rgbChunk) {
    var numbers = rgbChunk.match(R_UNFORMATTED_VALUES);
    var numbersLength = numbers.length;
    var sanitizedString = rgbChunk.match(R_RGB_PREFIX)[0];

    for (var i = 0; i < numbersLength; i++) {
      sanitizedString += parseInt(numbers[i], 10) + ',';
    }

    sanitizedString = sanitizedString.slice(0, -1) + ')';

    return sanitizedString;
  }


  /**
   * @param {Object} stateObject
   *
   * @return {Object} An Object of formatManifests that correspond to
   * the string properties of stateObject
   */
  function getFormatManifests (stateObject) {
    var manifestAccumulator = {};

    Tweenable.each(stateObject, function (prop) {
      var currentProp = stateObject[prop];

      if (typeof currentProp === 'string') {
        var rawValues = getValuesFrom(currentProp);

        manifestAccumulator[prop] = {
          'formatString': getFormatStringFrom(currentProp)
          ,'chunkNames': getFormatChunksFrom(rawValues, prop)
        };
      }
    });

    return manifestAccumulator;
  }


  /**
   * @param {Object} stateObject
   * @param {Object} formatManifests
   */
  function expandFormattedProperties (stateObject, formatManifests) {
    Tweenable.each(formatManifests, function (prop) {
      var currentProp = stateObject[prop];
      var rawValues = getValuesFrom(currentProp);
      var rawValuesLength = rawValues.length;

      for (var i = 0; i < rawValuesLength; i++) {
        stateObject[formatManifests[prop].chunkNames[i]] = +rawValues[i];
      }

      delete stateObject[prop];
    });
  }


  /**
   * @param {Object} stateObject
   * @param {Object} formatManifests
   */
  function collapseFormattedProperties (stateObject, formatManifests) {
    Tweenable.each(formatManifests, function (prop) {
      var currentProp = stateObject[prop];
      var formatChunks = extractPropertyChunks(
          stateObject, formatManifests[prop].chunkNames);
      var valuesList = getValuesList(
          formatChunks, formatManifests[prop].chunkNames);
      currentProp = getFormattedValues(
          formatManifests[prop].formatString, valuesList);
      stateObject[prop] = sanitizeRGBChunks(currentProp);
    });
  }


  /**
   * @param {Object} stateObject
   * @param {Array.<string>} chunkNames
   *
   * @return {Object} The extracted value chunks.
   */
  function extractPropertyChunks (stateObject, chunkNames) {
    var extractedValues = {};
    var currentChunkName, chunkNamesLength = chunkNames.length;

    for (var i = 0; i < chunkNamesLength; i++) {
      currentChunkName = chunkNames[i];
      extractedValues[currentChunkName] = stateObject[currentChunkName];
      delete stateObject[currentChunkName];
    }

    return extractedValues;
  }


  /**
   * @param {Object} stateObject
   * @param {Array.<string>} chunkNames
   *
   * @return {Array.<number>}
   */
  function getValuesList (stateObject, chunkNames) {
    var valueAccumulator = [];
    var chunkNamesLength = chunkNames.length;

    for (var i = 0; i < chunkNamesLength; i++) {
      valueAccumulator.push(stateObject[chunkNames[i]]);
    }

    return valueAccumulator;
  }


  /**
   * @param {string} formatString
   * @param {Array.<number>} rawValues
   *
   * @return {string}
   */
  function getFormattedValues (formatString, rawValues) {
    var formattedValueString = formatString;
    var rawValuesLength = rawValues.length;

    for (var i = 0; i < rawValuesLength; i++) {
      formattedValueString = formattedValueString.replace(
          VALUE_PLACEHOLDER, +rawValues[i].toFixed(4));
    }

    return formattedValueString;
  }


  /**
   * Note: It's the duty of the caller to convert the Array elements of the
   * return value into numbers.  This is a performance optimization.
   *
   * @param {string} formattedString
   *
   * @return {Array.<string>|null}
   */
  function getValuesFrom (formattedString) {
    return formattedString.match(R_UNFORMATTED_VALUES);
  }


  /**
   * @param {Object} easingObject
   * @param {Object} tokenData
   */
  function expandEasingObject (easingObject, tokenData) {
    Tweenable.each(tokenData, function (prop) {
      var currentProp = tokenData[prop];
      var chunkNames = currentProp.chunkNames;
      var chunkLength = chunkNames.length;
      var easingChunks = easingObject[prop].split(' ');
      var lastEasingChunk = easingChunks[easingChunks.length - 1];

      for (var i = 0; i < chunkLength; i++) {
        easingObject[chunkNames[i]] = easingChunks[i] || lastEasingChunk;
      }

      delete easingObject[prop];
    });
  }


  /**
   * @param {Object} easingObject
   * @param {Object} tokenData
   */
  function collapseEasingObject (easingObject, tokenData) {
    Tweenable.each(tokenData, function (prop) {
      var currentProp = tokenData[prop];
      var chunkNames = currentProp.chunkNames;
      var chunkLength = chunkNames.length;
      var composedEasingString = '';

      for (var i = 0; i < chunkLength; i++) {
        composedEasingString += ' ' + easingObject[chunkNames[i]];
        delete easingObject[chunkNames[i]];
      }

      composedEasingString = composedEasingString.substr(1);
      easingObject[prop] = composedEasingString;
    });
  }


  Tweenable.prototype.filter.token = {
    'tweenCreated': function (currentState, fromState, toState, easingObject) {
      sanitizeObjectForHexProps(currentState);
      sanitizeObjectForHexProps(fromState);
      sanitizeObjectForHexProps(toState);
      this._tokenData = getFormatManifests(currentState);
    },

    'beforeTween': function (currentState, fromState, toState, easingObject) {
      expandEasingObject(easingObject, this._tokenData);
      expandFormattedProperties(currentState, this._tokenData);
      expandFormattedProperties(fromState, this._tokenData);
      expandFormattedProperties(toState, this._tokenData);
    },

    'afterTween': function (currentState, fromState, toState, easingObject) {
      collapseFormattedProperties(currentState, this._tokenData);
      collapseFormattedProperties(fromState, this._tokenData);
      collapseFormattedProperties(toState, this._tokenData);
      collapseEasingObject(easingObject, this._tokenData);
    }
  };

} (Tweenable));

}());
