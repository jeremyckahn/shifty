
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
