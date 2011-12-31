/** @license
 * Shifty <http://jeremyckahn.github.com/shifty/>
 * Author: Jeremy Kahn - jeremyckahn@gmail.com
 * License: MIT
 * Version: 0.5.0+ (Sat, 31 Dec 2011 21:23:16 GMT)
 */

(function(){


// should be outside Shifty closure since it will be used by all modules
// won't generate global after build
var Tweenable;

(function Shifty (global) {

  var now
      ,DEFAULT_EASING = 'linear'
      // Making an alias, because Tweenable.prototype.formula will get looked
      // a lot, and this is way faster than resolving the symbol.
      ,easing;

  if (typeof SHIFTY_DEBUG_NOW === 'function') {
    now = SHIFTY_DEBUG_NOW;
  } else {
    /**
     * Get the current UNIX epoch time as an integer.  Exposed publicly as `Tweenable.util.now()`.
     * @returns {Number} An integer representing the current timestamp.
     */
    now = function () {
      return +new Date();
    };
  }

  /**
   * Handy shortcut for doing a for-in loop.  Takes care of all of the `hasOwnProperty` wizardry for you.  This is also exposed publicly, you can access it as `Tweenable.util.each()`.
   * @param {Object} obj The object to iterate through.
   * @param {Function} func The function to pass the object and "own" property to.  This handler function receives the `obj` back as the first parameter, and a property name as the second.
   */
  function each (obj, func) {
    var prop;

    for (prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        func(obj, prop);
      }
    }
  }

  /**
   * Does a basic copy of one Object's properties to another.  This is not a robust `extend` function, nor is it recusrsive.  It is only appropriate to use on objects that have primitive properties (Numbers, Strings, Boolean, etc.).  Exposed publicly as `Tweenable.util.simpleCopy()`
   * @param {Object} targetObject The object to copy into
   * @param {Object} srcObject The object to copy from
   * @returns {Object} A reference to the augmented `targetObj` Object
   */
  function simpleCopy (targetObj, srcObj) {
    each(srcObj, function (srcObj, prop) {
      targetObj[prop] = srcObj[prop];
    });

    return targetObj;
  }

  /**
   * Copies each property from `srcObj` onto `targetObj`, but only if the property to copy to `targetObj` is `undefined`.
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
   * Calculates the interpolated tween values of an Object based on the current time.
   * @param {Number} currentPosition The current position to evaluate the tween against.
   * @param {Object} params A configuration Object containing the values that this function requires.  The required properties in this Object are:
   *   @property {Object} originalState The original properties the Object is tweening from.
   *   @property {Object} to The destination properties the Object is tweening to.
   *   @property {Number} duration The length of the tween in milliseconds.
   *   @property {Number} timestamp The UNIX epoch time at which the tween began.
   *   @property {Object} easing An Object of strings.  This Object's keys correspond to the keys in `to`.
   * @param {Object} state A configuration object containing current state data of the tween.  Required properties:
   *   @property {Object} current The Object containing the current `Number` values of the tween.
   */
  function tweenProps (currentPosition, params, state) {
    var prop,
      normalizedPosition;

    normalizedPosition = (currentPosition - params.timestamp) / params.duration;

    for (prop in state.current) {
      if (state.current.hasOwnProperty(prop) && params.to.hasOwnProperty(prop)) {
        state.current[prop] = tweenProp(params.originalState[prop], params.to[prop], easing[params.easing[prop]], normalizedPosition);
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
   * @returns {number} The tweened value.
   */
  function tweenProp (from, to, easingFunc, position) {
    return from + (to - from) * easingFunc(position);
  }

  /**
   * Schedules an update.
   * @param {Function} handler The function to execute
   * @param {number} fps The fraction of a second in the update should occur.
   * @returns {number} The id of the update.
   */
  function scheduleUpdate (handler, fps) {
    return setTimeout(handler, 1000 / fps);
  }

  /**
   * Calls all of the functions bound to a specified hook on a `Tweenable` instance.
   * @param {String} hookName The name of the hook to invoke the handlers of.
   * @param {Object} hooks The object containing the hook Arrays.
   * @param {Object} applyTo The `Tweenable` instance to call the hooks upon.
   * @param {Array} args The arguments to pass to each function in the specified hook.
   */
  function invokeHook (hookName, hooks, applyTo, args) {
    var i;

    for (i = 0; i < hooks[hookName].length; i++) {
      hooks[hookName][i].apply(applyTo, args);
    }
  }

  /**
   * Applies a Shifty filter to `Tweenable` instance.
   * @param {String} filterName The name of the filter to apply.
   * @param {Object} applyTo The `Tweenable` instance to call the filter upon.
   * @param {Array} args The arguments to pass to the function in the specified filter.
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
   * @param {Object} params The configuration containing all of a tween's properties.  This requires all of the `params` @properties required for `tweenProps`, so see that.  It also requires:
   *   @property {Object} owner The `Tweenable` instance that the tween this function is acting upon belongs to.
   *   @property {Object} hook The Object containing all of the `hook`s that belong to `owner
   * @param {Object} state The configuration Object containing all of the state properties for a `Tweenable` instance.  It requires all of the @properties listed for the `state` parameter of  `tweenProps`, so see that.  It also requires:
   *   @property {Boolean} isTweening Whether or not this tween as actually running.
   *   @property {Number} loopId The property that the latest `setTimeout` invokation ID stored in.
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

      applyFilter('beforeTween', params.owner, [state.current, params.originalState, params.to]);
      tweenProps (currentTime, params, state);
      applyFilter('afterTween', params.owner, [state.current, params.originalState, params.to]);

      if (params.hook.step) {
        invokeHook('step', params.hook, params.owner, [state.current]);
      }

      if (params.step) {
        params.step.call(state.current);
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
   * Creates a fully-usable easing Object from either a string or another easing Object.  If `easing` is an Object, then this function clones it and fills in the missing properties with "linear".
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
   * @param {Object} options A configuration Object containing options for the `Tweenable` instance.  The following are valid:
   *   @property {Object} initialState The state at which the first tween should begin at.
   *   @property {Number} duration The default `duration` for each `tween` made by this instance.  Default is 500 milliseconds.
   *   @property {Number} fps The frame rate (frames per second) at which the instance will update.  Default is 30.
   *   @property {String} easing The name of the default easing formula (attached to `Tweenable.prototype.formula`) to use for each `tween` made for this instance.  Default is `linear`.
   * returns {Object} `Tweenable` instance for chaining.
   */
  Tweenable = function (options) {
    options = options || {};

    this._hook = {};

    this._tweenParams = {
      'owner': this
      ,'hook': this._hook
      ,'data': {} // holds arbitrary data
    };

    this._state = {};

    // The state that the tween begins at.
    this._state.current = options.initialState || {};

    // The framerate at which Shifty updates.  This is exposed publicly as `tweenableInst.fps`.
    this.fps = options.fps || 30;

    // The default easing formula.  This is exposed publicly as `tweenableInst.easing`.
    this.easing = options.easing || DEFAULT_EASING;

    // The default `duration`.  This is exposed publicly as `tweenableInst.duration`.
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
   * Regardless of how you invoke this method, the only required parameters are `from` and `to`.
   *
   * @param {Object} from The beginning state Object containing the properties to tween from.  NOTE:  The properties of this Object are modified over time (to reflect the values in `to`).
   * @param {Object} to The target state Object containing the properties to tween to.
   * @param {Number} duration The amount of time in milliseconds that the tween should run for.
   * @param {Function} start The function to be invoked as soon as the this tween starts.  Mostly useful when used with the `queue` extension.
   * @param {Function} callback The function to invoke as soon as this tween completes.  This function is given the tween's current state Object as the first parameter.
   * @param {String|Object} easing This can either be a string specifying the easing formula to be used on every property of the tween, or an Object with values that are strings that specify an easing formula for a specific property.  Any properties that do not have an easing formula specified will use "linear".
   * @param {Function} step A function to call for each step of the tween.  A "step" is defined as one update cycle (frame) of the tween.  Many update cycles occur to create the illusion of motion, so this function will likely be called quite a bit.
   */
  Tweenable.prototype.tween = function tween (from, to, duration, callback, easing) {

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

    // Normalize some internal values depending on how `tweenableInst.tween` was invoked
    if (to) {
      // Assume the shorthand syntax is being used.
      params.to = to || {};
      params.duration = duration || this.duration;
      params.callback = callback;
      params.easing = easing || this.easing;
      state.current = from || {};
    } else {
      // If the second argument is not present, assume the longhand syntax is being used.
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
    applyFilter('tweenCreated', params.owner, [state.current, params.originalState, params.to]);
    params.originalState = simpleCopy({}, state.current);
    state.isTweening = true;
    this.resume();

    if (from.start) {
      from.start();
    }

    return this;
  };

  /**
   * Convenience method for tweening from the current position.  This method functions identically to `tween()` (it's just a wrapper function), but implicitly passes the `Tweenable` instance's current state (what you get from `get()`) as the `from` parameter.  This supports both the longhand and shorthand syntax that `tween()` does, just omitting the `from` paramter in both cases.
   * @param {Object} target If the other parameters are omitted, this Object should contain the longhand parameters outlined in `tween()`.  If at least one other formal parameter is specified, then this Object should contain the target values to tween to.
   * @param {Number} duration Duration of the tween, in milliseconds.
   * @param {Function} callback The callback function to pass along to `tween()`.
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
   * Returns a reference to the `Tweenable`'s current state (the `from` Object that wat passed to `tweenableInst.tween()`).
   * @returns {Object}
   */
  Tweenable.prototype.get = function get () {
    return this._state.current;
  };

  /**
   * Force the `Tweenable` instance's current state.
   * @param {Object} state The state the instance shall have.
   */
  Tweenable.prototype.set = function set (state) {
    this._state.current = state || {};

    return this;
  };

  /**
   * Stops and cancels a tween.
   * @param {Boolean} gotoEnd If `false`, or omitted, the tween just stops at its current state, and the `callback` is not invoked.  If `true`, the tweened object's values are instantly set the the target "to" values, and the `callback` is invoked.
   * @returns {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.stop = function stop (gotoEnd) {
    clearTimeout(this._state.loopId);
    this._state.isTweening = false;

    if (gotoEnd) {
      simpleCopy(this._state.current, this._tweenParams.to);
      applyFilter('afterTweenEnd', this, [this._state.current, this._tweenParams.originalState, this._tweenParams.to]);
      if (this._tweenParams.callback) {
        this._tweenParams.callback.call(this._state.current);
      }
    }

    return this;
  };

  /**
   * Pauses a tween.  A `pause`d tween can be resumed with `resume()`.
   * @returns {Object} The `Tween` instance for chaining.
   */
  Tweenable.prototype.pause = function pause () {
    clearTimeout(this._state.loopId);
    this._state.pausedAtTime = now();
    this._state.isPaused = true;
    return this;
  };

  /**
   * Resumes a paused tween.  A tween must be `pause`d before is can be `resume`d.
   * @returns {Object} The `Tweenable` instance for chaining.
   */
  Tweenable.prototype.resume = function resume () {
    var self;

    self = this;

    if (this._state.isPaused) {
      this._tweenParams.timestamp += now() - this._state.pausedAtTime;
    }

    timeoutHandler(self._tweenParams, self._state);

    return this;
  };

  /**
   * Add a hook to the `Tweenable` instance.  Hooks are functions that are invoked at key points in a `Tweenable` instance's lifecycle.  A hook that is related to the tweening process (like `step`), for example, will occur for every tween that is performed by the `Tweenable` instance.  You just have to set it once.  You can attach as many functions to any given hook as you like.  The available hooks are as follows:
   *
   *   - `step`:  Runs on every frame that a tween runs for.  Hook handler function receives a tween's `currentState` for a parameter.
   *
   * @param {String} hookName The name of the hook to attach `hookFunc` to.
   * @param {Function} hookFunc The hook handler function.  This function will receive parameters based on what hook it is being attached to.
   */
  Tweenable.prototype.hookAdd = function hookAdd (hookName, hookFunc) {
    if (!this._hook.hasOwnProperty(hookName)) {
      this._hook[hookName] = [];
    }

    this._hook[hookName].push(hookFunc);
  };

  /**
   * Unattach a function from a hook, or all functions.
   *
   * @param {String} hookName The hook to remove a function or functions from.
   * @param {String|undefined} hookFunc The function to matched against and remove from the hook handler list.  If omitted, all functions are removed for the hook specified by `hookName`.
   */
  Tweenable.prototype.hookRemove = function hookRemove (hookName, hookFunc) {
    var i;

    if (!this._hook.hasOwnProperty(hookName)) {
      return;
    }

    if (!hookFunc) {
      this._hook[hookName] = [];
      return;
    }

    for (i = this._hook[hookName].length; i >= 0; i++) {
      if (this._hook[hookName][i] === hookFunc) {
        this._hook[hookName].splice(i, 1);
      }
    }
  };

  /**
   * Globally exposed static property to attach filters to.  Filters are used for transforming the properties of a tween at various points in a `Tweenable` instance's lifecycle.  Please consult the README for more info on this.
   */
  Tweenable.prototype.filter = {};

  /**
   * Globally exposed static helper methods.  These methods are used internally and could be helpful in a global context as well.
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
   * This object contains all of the tweens available to Shifty.  It is extendable - simply attach properties to the Tweenable.prototype.formula Object following the same format at `linear`.
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
Shifty Easing Formulas
Adapted for Shifty by Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

================================
All equations are adapted from Thomas Fuchs' Scripty2: https://raw.github.com/madrobby/scripty2/master/src/effects/transitions/penner.js
Based on Easing Equations (c) 2003 Robert Penner, all rights reserved. (http://www.robertpenner.com/)
This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
================================

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function () {

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

(function shiftyQueue () {

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

  Tweenable.prototype.queueStart = function () {
    if (!this._tweenQueue.running && this._tweenQueue.length > 0) {
      this._tweenQueue[0]();
      this._tweenQueue.running = true;
    }

    return this;
  };

  Tweenable.prototype.queueShift = function () {
    this._tweenQueue.shift();
    return this;
  };

  Tweenable.prototype.queuePop = function () {
    this._tweenQueue.pop();
    return this;
  };

  Tweenable.prototype.queueEmpty = function () {
    this._tweenQueue.length = 0;
    return this;
  };

  Tweenable.prototype.queueLength = function () {
    return this._tweenQueue.length;
  };

}());

/**
Shifty Color Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.color.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyColor () {

  var R_SHORTHAND_HEX = /^#([0-9]|[a-f]){3}$/i,
    R_LONGHAND_HEX = /^#([0-9]|[a-f]){6}$/i,
    R_RGB = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)\s*$/i,
    savedRGBPropNames;
  
  if (!Tweenable) {
    return;
  }
  
  /**
   * Convert a base-16 number to base-10.
   * @param {Number|String} hex The value to convert
   * @returns {Number} The base-10 equivalent of `hex`.
   */
  function hexToDec (hex) {
    return parseInt(hex, 16);
  }

  /**
   * Convert a hexadecimal string to an array with three items, one each for the red, blue, and green decimal values.
   * @param {String} hex A hexadecimal string.
   * @returns {Array} The converted Array of RGB values if `hex` is a valid string, or an Array of three 0's.
   */
  function hexToRGBArr (hex) {
    
    hex = hex.replace(/#/g, '');
    
    // If the string is a shorthand three digit hex notation, normalize it to the standard six digit notation
    if (hex.length === 3) {
      hex = hex.split('');
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    return [hexToDec(hex.substr(0, 2)), hexToDec(hex.substr(2, 2)), hexToDec(hex.substr(4, 2))];
  }
  
  function getRGBStringFromHex (str) {
    var rgbArr,
      convertedStr;
    rgbArr = hexToRGBArr(str);
    convertedStr = 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
    
    return convertedStr;
  }
  
  function isColorString (str) {
    return (typeof str === 'string') && (R_SHORTHAND_HEX.test(str) || R_LONGHAND_HEX.test(str) || R_RGB.test(str));
  }
  
  function isHexString (str) {
    return (typeof str === 'string') && (R_SHORTHAND_HEX.test(str) || R_LONGHAND_HEX.test(str));
  }
  
  function convertHexStringPropsToRGB (obj) {
    Tweenable.util.each(obj, function (obj, prop) {
      if (isHexString(obj[prop])) {
        obj[prop] = getRGBStringFromHex(obj[prop]);
      }
    });
  }
  
  function getColorStringPropNames (obj) {
    var list;
    
    list = [];
    
    Tweenable.util.each(obj, function (obj, prop) {
      if (isColorString(obj[prop])) {
        list.push(prop);
      }
    });
    
    return list;
  }
  
  function rgbToArr (str) {
    return str.match(/(\d+)/g);
  }
  
  function splitRGBChunks (obj, rgbPropNames) {
    var i,
      limit,
      rgbParts;
      
      limit = rgbPropNames.length;
      
      for (i = 0; i < limit; i++) {
        rgbParts = rgbToArr(obj[rgbPropNames[i]]);
        obj['__r__' + rgbPropNames[i]] = +rgbParts[0];
        obj['__g__' + rgbPropNames[i]] = +rgbParts[1];
        obj['__b__' + rgbPropNames[i]] = +rgbParts[2];
        delete obj[rgbPropNames[i]];
      }
  }
  
  function joinRGBChunks (obj, rgbPropNames) {
    var i,
        limit;
      
    limit = rgbPropNames.length;
    
    for (i = 0; i < limit; i++) {
      
      obj[rgbPropNames[i]] = 'rgb(' + 
        parseInt(obj['__r__' + rgbPropNames[i]], 10) + ',' + 
        parseInt(obj['__g__' + rgbPropNames[i]], 10) + ',' + 
        parseInt(obj['__b__' + rgbPropNames[i]], 10) + ')';
      
      delete obj['__r__' + rgbPropNames[i]];
      delete obj['__g__' + rgbPropNames[i]];
      delete obj['__b__' + rgbPropNames[i]];
    }
  }

  function expandEasingObject (easingObject, rgbPropNames) {
    var i,
        limit;
      
    limit = rgbPropNames.length;
    
    for (i = 0; i < limit; i++) {
      easingObject['__r__' + rgbPropNames[i]] = easingObject[rgbPropNames[i]];
      easingObject['__g__' + rgbPropNames[i]] = easingObject[rgbPropNames[i]];
      easingObject['__b__' + rgbPropNames[i]] = easingObject[rgbPropNames[i]];
    }
  }

  function collapseEasingObject (easingObject, rgbPropNames) {
    var i,
        limit;
      
    limit = rgbPropNames.length;
    
    for (i = 0; i < limit; i++) {
      delete easingObject['__r__' + rgbPropNames[i]];
      delete easingObject['__g__' + rgbPropNames[i]];
      delete easingObject['__b__' + rgbPropNames[i]];
    }
  }
  
  Tweenable.prototype.filter.color = {
    'tweenCreated': function tweenCreated (currentState, fromState, toState) {
      convertHexStringPropsToRGB(currentState);
      convertHexStringPropsToRGB(fromState);
      convertHexStringPropsToRGB(toState);
    },
    
    'beforeTween': function beforeTween (currentState, fromState, toState) {
      savedRGBPropNames = getColorStringPropNames(fromState);
      
      splitRGBChunks(currentState, savedRGBPropNames);
      splitRGBChunks(fromState, savedRGBPropNames);
      splitRGBChunks(toState, savedRGBPropNames);
      expandEasingObject(this._tweenParams.easing, savedRGBPropNames);
    },
    
    'afterTween': function afterTween (currentState, fromState, toState) {
      joinRGBChunks(currentState, savedRGBPropNames);
      joinRGBChunks(fromState, savedRGBPropNames);
      joinRGBChunks(toState, savedRGBPropNames);
      collapseEasingObject(this._tweenParams.easing, savedRGBPropNames);
    }
  };
  
}());

/**
Shifty CSS Unit Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.css_units.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyCSSUnits () {

  var R_CSS_UNITS = /(px|em|%|pc|pt|mm|cm|in|ex)/i,
    R_QUICK_CSS_UNITS = /([a-z]|%)/gi,
    savedTokenProps;
  
  function isValidString (str) {
    return typeof str === 'string' && R_CSS_UNITS.test(str);
  }
  
  function getTokenProps (obj) {
    var collection;

    collection = {};
    
    Tweenable.util.each(obj, function (obj, prop) {
      if (isValidString(obj[prop])) {
        collection[prop] = {
          'suffix': obj[prop].match(R_CSS_UNITS)[0]
        };
      }
    });
    
    return collection;
  }
  
  function deTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      // Extract the value from the string
      obj[token] = +(obj[token].replace(R_QUICK_CSS_UNITS, ''));
    });
  }
  
  function reTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      obj[token] = obj[token] + collection[token].suffix;
    });
  }
  
  Tweenable.prototype.filter.token = {
    'beforeTween': function beforeTween (currentState, fromState, toState) {
      savedTokenProps = getTokenProps(fromState);
      
      deTokenize(currentState, savedTokenProps);
      deTokenize(fromState, savedTokenProps);
      deTokenize(toState, savedTokenProps);
    },
    
    'afterTween': function afterTween (currentState, fromState, toState) {
      reTokenize(currentState, savedTokenProps);
      reTokenize(fromState, savedTokenProps);
      reTokenize(toState, savedTokenProps);
    }
  };
  
}());

/*global setTimeout:true, clearTimeout:true */

/**
Shifty Interpolate Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: shifty.core.js

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny and this extension, please consult the manual: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyInterpolate () {
  
  if (!Tweenable) {
    return;
  }
  
  function getInterpolatedValues (from, current, to, position, easing) {
    var easingObject;

    easingObject = Tweenable.util.composeEasingObject(from, easing);

    return Tweenable.util.tweenProps(position, {
      'originalState': from
      ,'to': to
      ,'timestamp': 0
      ,'duration': 1
      ,'easing': easingObject
    }, {
      'current': current
    });
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
    mockTweenable._tweenParams.easing = easing;
    current = Tweenable.util.simpleCopy({}, from);
    
    // Call any data type filters
    Tweenable.util.applyFilter('tweenCreated', mockTweenable, [current, from, to]);
    Tweenable.util.applyFilter('beforeTween', mockTweenable, [current, from, to]);
    interpolatedValues = getInterpolatedValues (from, current, to, position, mockTweenable._tweenParams.easing);
    Tweenable.util.applyFilter('afterTween', mockTweenable, [interpolatedValues, from, to]);
    
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

}());
