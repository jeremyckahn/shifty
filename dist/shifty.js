/** @license
 * Shifty <http://jeremyckahn.github.com/shifty/>
 * Description: A teeny tiny tweening engine in JavaScript. That's all it does.
 * Author: Jeremy Kahn - jeremyckahn@gmail.com
 * License: MIT
 * Version: 0.7.0 (Sun, 11 Nov 2012 01:28:02 GMT)
 */

;(function(){

/**
 * Shifty Core
 * By Jeremy Kahn - jeremyckahn@gmail.com
 */

// Should be outside the following closure since it will be used by all
// modules.  It won't generate any globals after building.
var Tweenable;

// UglifyJS define hack
if (typeof SHIFTY_DEBUG_NOW === 'undefined') {
  SHIFTY_DEBUG_NOW = function () {
    return +new Date();
  };
}

;(function (global) {

  var now
      ,DEFAULT_EASING = 'linear'
      // Making an alias, because Tweenable.prototype.formula will get looked
      // a lot, and this is way faster than resolving the symbol.
      ,easing;

  if (SHIFTY_DEBUG_NOW) {
    now = SHIFTY_DEBUG_NOW;
  } else {
    /**
     * Get the current UNIX epoch time as an integer.  Exposed publicly as
     * `Tweenable.util.now()`.  @return {Number} An integer representing the
     * current timestamp.
     */
    now = function () {
      return +new Date();
    };
  }

  /**
   * Handy shortcut for doing a for-in loop.  Takes care of all of the
   * `hasOwnProperty` wizardry for you.  This is also exposed publicly, you can
   * access it as `Tweenable.util.each()`.
   * @param {Object} obj The object to iterate through.
   * @param {Function} func The function to pass the object and "own" property
   *     to.  This handler function receives the `obj` back as the first
   *     parameter, and a property name as the second.
   */
  function each (obj, func) {
    var prop;

    for (prop in obj) {
      if (Object.hasOwnProperty.call(obj, prop)) {
        func(obj, prop);
      }
    }
  }

  /**
   * Does a basic copy of one Object's properties to another.  This is not a
   * robust `extend` function, nor is it recusrsive.  It is only appropriate to
   * use on objects that have primitive properties (Numbers, Strings, Boolean,
   * etc.).  Exposed publicly as `Tweenable.util.simpleCopy()`
   * @param {Object} targetObject The object to copy into
   * @param {Object} srcObject The object to copy from @return {Object} A
   *     reference to the augmented `targetObj` Object
   */
  function simpleCopy (targetObj, srcObj) {
    each(srcObj, function (srcObj, prop) {
      targetObj[prop] = srcObj[prop];
    });

    return targetObj;
  }

  /**
   * Copies each property from `srcObj` onto `targetObj`, but only if the
   * property to copy to `targetObj` is `undefined`.
   */
  function weakCopy (targetObj, srcObj) {
    each(srcObj, function (srcObj, prop) {
      if (typeof targetObj[prop] === 'undefined') {
        targetObj[prop] = srcObj[prop];
      }
    });

    return targetObj;
  }

  /**
   * Calculates the interpolated tween values of an Object based on the current
   * time.
   * @param {Number} currentPosition The current position to evaluate the tween
   * against.
   * @param {Object} params A configuration Object containing the values that
   *      this function requires.  The required properties in this Object are:
   *   @property {Object} originalState The original properties the Object is
   *       tweening from.
   *   @property {Object} to The destination properties the Object is tweening
   *       to.
   *   @property {Number} duration The length of the tween in milliseconds.
   *   @property {Number} timestamp The UNIX epoch time at which the tween
   *       began.
   *   @property {Object} easing An Object of strings.  This Object's keys
   *       correspond to the keys in `to`.
   * @param {Object} state A configuration object containing current state data
   *     of the tween.  Required properties:
   *   @property {Object} current The Object containing the current `Number`
   *       values of the tween.
   */
  function tweenProps (currentPosition, params, state) {
    var prop,
      normalizedPosition;

    normalizedPosition = (currentPosition - params.timestamp) /
      params.duration;

    for (prop in state.current) {
      if (state.current.hasOwnProperty(prop)
          && params.to.hasOwnProperty(prop)) {
          state.current[prop] = tweenProp(params.originalState[prop],
              params.to[prop], easing[params.easing[prop]],
              normalizedPosition);
      }
    }

    return state.current;
  }

  /**
   * Tweens a single property.
   * @param {number} from The origination value of the tween.
   * @param {number} to The destination value of the tween.
   * @param {Function} easingFunc The easing formula to apply to the tween.
   * @param {number} position The normalized position (between 0.0 and 1.0) to
   *    calculate the midpoint of 'from' and 'to' against.
   * @return {number} The tweened value.
   */
  function tweenProp (from, to, easingFunc, position) {
    return from + (to - from) * easingFunc(position);
  }

  /**
   * Schedules an update.
   * @param {Function} handler The function to execute
   * @param {number} fps The fraction of a second in the update should occur.
   * @return {number} The id of the update.
   */
  function scheduleUpdate (handler, fps) {
    return setTimeout(handler, 1000 / fps);
  }

  /**
   * Applies a Shifty filter to `Tweenable` instance.
   * @param {String} filterName The name of the filter to apply.
   * @param {Object} applyTo The `Tweenable` instance to call the filter upon.
   * @param {Array} args The arguments to pass to the function in the specified
   * filter.
   */
  function applyFilter (filterName, applyTo, args) {
    each(Tweenable.prototype.filter, function (filters, name) {
      if (filters[name][filterName]) {
        filters[name][filterName].apply(applyTo, args);
      }
    });
  }

  /**
   * Handles the update logic for one step of a tween.
   * @param {Object} params The configuration containing all of a tween's
   *     properties.  This requires all of the `params` @properties required
   *     for `tweenProps`, so see that.  It also requires:
   *   @property {Object} owner The `Tweenable` instance that the tween this
   *   function is acting upon belongs to.
   * @param {Object} state The configuration Object containing all of the state
   *     properties for a `Tweenable` instance.  It requires all of the
   *     @properties listed for the `state` parameter of  `tweenProps`, so see
   *     that.  It also requires:
   *   @property {Boolean} isTweening Whether or not this tween as actually
   *       running.
   *   @property {Number} loopId The property that the latest `setTimeout`
   *       invokation ID stored in.
   */
  function timeoutHandler (params, state) {
    var endTime = params.timestamp + params.duration
        ,currentTime = Math.min(now(), endTime)
        ,didEnded = currentTime >= endTime;

    if (state.isTweening) {
      if (!didEnded) {
        // The tween is still running, schedule an update
        state.loopId = scheduleUpdate(function () {
          timeoutHandler(params, state);
        }, params.owner.fps);
      }

      applyFilter('beforeTween', params.owner, [state.current,
          params.originalState, params.to, params.easing]);
      tweenProps (currentTime, params, state);
      applyFilter('afterTween', params.owner, [state.current,
          params.originalState, params.to, params.easing]);

      if (params.step) {
        params.step.call(state.current, state.current);
      }

    }

    if (didEnded || !state.isTweening) {
      // The duration of the tween has expired
      params.owner.stop(true);
    }
  }

  // A hook used for unit testing.
  if (typeof SHIFTY_DEBUG_NOW === 'function') {
    global.timeoutHandler = timeoutHandler;
  }


  /**
   * Creates a fully-usable easing Object from either a string or another
   * easing Object.  If `easing` is an Object, then this function clones it and
   * fills in the missing properties with "linear".
   * @param {Object} fromTweenParams
   * @param {Object|string} easing
   */
  function composeEasingObject (fromTweenParams, easing) {
    var composedEasing;

    composedEasing = {};

    if (typeof easing === 'string') {
      each(fromTweenParams, function (obj, prop) {
        composedEasing[prop] = easing;
      });
    // else, it's an Object
    } else {
      each(fromTweenParams, function (obj, prop) {
        if (!composedEasing[prop]) {
          composedEasing[prop] = easing[prop] || DEFAULT_EASING;
        }
      });
    }

    return composedEasing;
  }

  /**
   * This is the `Tweenable` constructor.  Do this for fun tweeny goodness:
   * @codestart
   * var tweenableInst = new Tweenable({});
   * @codeend
   *
   * It accepts one parameter:
   *
   * @param {Object} options A configuration Object containing options for the
   *     `Tweenable` instance.  The following are valid:
   *   @property {Object} initialState The state at which the first tween
   *       should begin at.
   *   @property {Number} duration The default `duration` for each `tween` made
   *       by this instance.  Default is 500 milliseconds.
   *   @property {Number} fps The frame rate (frames per second) at which the
   *       instance will update.  Default is 30.
   *   @property {String} easing The name of the default easing formula
   *       (attached to `Tweenable.prototype.formula`) to use for each `tween`
   *       made for this instance.  Default is `linear`.
   * @return {Object} `Tweenable` instance for chaining.
   */
  Tweenable = function (options) {
    options = options || {};


    this._tweenParams = {
      'owner': this
      ,'data': {} // holds arbitrary data
    };

    this._state = {};

    // The state that the tween begins at.
    this._state.current = options.initialState || {};

    // The framerate at which Shifty updates.  This is exposed publicly as
    // `tweenableInst.fps`.
    this.fps = options.fps || 30;

    // The default easing formula.  This is exposed publicly as
    // `tweenableInst.easing`.
    this.easing = options.easing || DEFAULT_EASING;

    // The default `duration`.  This is exposed publicly as
    // `tweenableInst.duration`.
    this.duration = options.duration || 500;

    return this;
  };

  /**
   * Start a tween.  This method can be called two ways.  The shorthand way:
   *
   *   tweenableInst.tween (from, to, [duration], [callback], [easing]);
   *
   * or the longhand way:
   *
   *   tweenableInst.tween ( {
   *     from:       Object,
   *     to:         Object,
   *     duration:   Number,
   *     callback:   Function,
   *     easing:     String|Object,
   *     step:       Function
   *   });
   *
   * Regardless of how you invoke this method, the only required parameters are
   * `from` and `to`.
   *
   * @param {Object} from The beginning state Object containing the properties
   *     to tween from.  NOTE:  The properties of this Object are modified over
   *     time (to reflect the values in `to`).
   * @param {Object} to The target state Object containing the properties to
   *     tween to.
   * @param {Number} duration The amount of time in milliseconds that the tween
   *     should run for.
   * @param {Function} start The function to be invoked as soon as the this
   *     tween starts.  Mostly useful when used with the `queue` extension.
   * @param {Function} callback The function to invoke as soon as this tween
   *     completes.  This function is given the tween's current state Object as
   *     the first parameter.
   * @param {String|Object} easing This can either be a string specifying the
   *     easing formula to be used on every property of the tween, or an Object
   *     with values that are strings that specify an easing formula for a
   *     specific property.  Any properties that do not have an easing formula
   *     specified will use "linear".
   * @param {Function} step A function to call for each step of the tween.  A
   *     "step" is defined as one update cycle (frame) of the tween.  Many
   *     update cycles occur to create the illusion of motion, so this function
   *     will likely be called quite a bit.
   */
  Tweenable.prototype.tween = function (from, to, duration, callback, easing) {

    var self
        ,params
        ,state;

    if (this._state.isTweening) {
      return;
    }

    self = this;
    params = this._tweenParams;
    state = this._state;
    this._state.loopId = 0;
    this._state.pausedAtTime = null;

    // Normalize some internal values depending on how `tweenableInst.tween`
    // was invoked
    if (to) {
      // Assume the shorthand syntax is being used.
      params.to = to || {};
      params.duration = duration || this.duration;
      params.callback = callback;
      params.easing = easing || this.easing;
      state.current = from || {};
    } else {
      // If the second argument is not present, assume the longhand syntax is
      // being used.
      params.step = from.step;
      params.callback = from.callback;
      params.to = from.to || from.target || {};
      params.duration = from.duration || this.duration;
      params.easing = from.easing || this.easing;
      state.current = from.from || {};
    }

    params.timestamp = now();

    // Ensure that there is always something to tween to.
    // Kinda dumb and wasteful, but makes this code way more flexible.
    weakCopy(state.current, params.to);
    weakCopy(params.to, state.current);

    params.easing = composeEasingObject(state.current, params.easing);
    params.originalState = simpleCopy({}, state.current);
    applyFilter('tweenCreated', params.owner, [state.current,
        params.originalState, params.to, params.easing]);
    state.isTweening = true;
    this.resume();

    if (from.start) {
      from.start();
    }

    return this;
  };

  /**
   * Convenience method for tweening from the current position.  This method
   * functions identically to `tween()` (it's just a wrapper function), but
   * implicitly passes the `Tweenable` instance's current state (what you get
   * from `get()`) as the `from` parameter.  This supports both the longhand
   * and shorthand syntax that `tween()` does, just omitting the `from`
   * paramter in both cases.
   * @param {Object} target If the other parameters are omitted, this Object
   *     should contain the longhand parameters outlined in `tween()`.  If at
   *     least one other formal parameter is specified, then this Object should
   *     contain the target values to tween to.
   * @param {Number} duration Duration of the tween, in milliseconds.
   * @param {Function} callback The callback function to pass along to
   *     `tween()`.
   * @param {String|Object} easing The easing formula to use.
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
   * Returns a reference to the `Tweenable`'s current state (the `from` Object
   * that wat passed to `tweenableInst.tween()`).
   * @return {Object}
   */
  Tweenable.prototype.get = function () {
    return this._state.current;
  };

  /**
   * Force the `Tweenable` instance's current state.
   * @param {Object} state The state the instance shall have.
   */
  Tweenable.prototype.set = function  (state) {
    this._state.current = state || {};

    return this;
  };

  /**
   * Stops and cancels a tween.
   * @param {Boolean} gotoEnd If `false`, or omitted, the tween just stops at
   *     its current state, and the `callback` is not invoked.  If `true`, the
   *     tweened object's values are instantly set the the target "to" values,
   *     and the `callback` is invoked.
   * @return {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.stop = function (gotoEnd) {
    clearTimeout(this._state.loopId);
    this._state.isTweening = false;

    if (gotoEnd) {
      simpleCopy(this._state.current, this._tweenParams.to);
      applyFilter('afterTweenEnd', this, [this._state.current,
          this._tweenParams.originalState, this._tweenParams.to,
          this._tweenParams.easing]);
      if (this._tweenParams.callback) {
        this._tweenParams.callback.call(this._state.current,
            this._state.current);
      }
    }

    return this;
  };

  /**
   * Pauses a tween.  A `pause`d tween can be resumed with `resume()`.
   * @return {Object} The `Tween` instance for chaining.
   */
  Tweenable.prototype.pause = function () {
    clearTimeout(this._state.loopId);
    this._state.pausedAtTime = now();
    this._state.isPaused = true;
    return this;
  };

  /**
   * Resumes a paused tween.  A tween must be `pause`d before is can be
   * `resume`d.
   * @return {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.resume = function () {
    var self;

    self = this;

    if (this._state.isPaused) {
      this._tweenParams.timestamp += now() - this._state.pausedAtTime;
    }

    timeoutHandler(self._tweenParams, self._state);

    return this;
  };

  /**
   * Globally exposed static property to attach filters to.  Filters are used
   * for transforming the properties of a tween at various points in a
   * `Tweenable` instance's lifecycle.  Please consult the README for more info
   * on this.
   */
  Tweenable.prototype.filter = {};

  /**
   * Globally exposed static helper methods.  These methods are used internally
   * and could be helpful in a global context as well.
   */
  Tweenable.util = {
    'now': now
    ,'each': each
    ,'tweenProps': tweenProps
    ,'tweenProp': tweenProp
    ,'applyFilter': applyFilter
    ,'simpleCopy': simpleCopy
    ,'weakCopy': weakCopy
    ,'composeEasingObject': composeEasingObject
  };

  /**
   * This object contains all of the tweens available to Shifty.  It is
   * extendable - simply attach properties to the Tweenable.prototype.formula
   * Object following the same format at `linear`.
   */
  easing = Tweenable.prototype.formula = {
    linear: function (pos) {
      return pos;
    }
  };

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

  Tweenable.util.simpleCopy(Tweenable.prototype.formula, {
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

  function getInterpolatedValues (from, current, to, position, easing) {
    return Tweenable.util.tweenProps(position, {
      'originalState': from
      ,'to': to
      ,'timestamp': 0
      ,'duration': 1
      ,'easing': easing
    }, {
      'current': current
    });
  }


  function expandEasingParam (stateObject, easingParam) {
    var easingObject = easingParam;

    if (typeof easingParam === 'string') {
      easingObject = {};
      Tweenable.util.each(stateObject, function (obj, prop) {
        easingObject[prop] = obj[prop];
      });
    }

    return easingObject;
  }


  // This is the static utility version of the function.
  Tweenable.util.interpolate = function (from, to, position, easing) {
    var current
        ,interpolatedValues
        ,mockTweenable;

    // Function was passed a configuration object, extract the values
    if (from && from.from) {
      to = from.to;
      position = from.position;
      easing = from.easing;
      from = from.from;
    }

    mockTweenable = new Tweenable();
    mockTweenable._tweenParams.easing = easing || 'linear';
    current = Tweenable.util.simpleCopy({}, from);
    var easingObject = Tweenable.util.composeEasingObject(
        from, mockTweenable._tweenParams.easing);

    // Call any data type filters
    Tweenable.util.applyFilter('tweenCreated', mockTweenable,
        [current, from, to, easingObject]);
    Tweenable.util.applyFilter('beforeTween', mockTweenable,
        [current, from, to, easingObject]);
    interpolatedValues = getInterpolatedValues(
        from, current, to, position, easingObject);
    Tweenable.util.applyFilter('afterTween', mockTweenable,
        [interpolatedValues, from, to, easingObject]);

    return interpolatedValues;
  };


  // This is the inheritable instance-method version of the function.
  Tweenable.prototype.interpolate = function (to, position, easing) {
    var interpolatedValues;

    interpolatedValues = Tweenable.util.interpolate(this.get(), to, position, easing);
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
    Tweenable.util.each(stateObject, function (obj, prop) {
      var currentProp = obj[prop];

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

    Tweenable.util.each(stateObject, function (obj, prop) {
      var currentProp = obj[prop];

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
    Tweenable.util.each(formatManifests, function (obj, prop) {
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
    Tweenable.util.each(formatManifests, function (obj, prop) {
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
    Tweenable.util.each(tokenData, function (obj, prop) {
      var currentProp = obj[prop];
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
    Tweenable.util.each(tokenData, function (obj, prop) {
      var currentProp = obj[prop];
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
