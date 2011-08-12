/*global setTimeout:true, clearTimeout:true */

/**
Shifty - A teeny tiny tweening engine in JavaScript. 
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.4.3

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function Shifty (global) {
	
	/**
	 * Get the current UNIX epoch time as an integer.  Exposed publicly as `Tweenable.util.now()`.
	 * @returns {Number} An integer representing the current timestamp.
	 */
	function now () {
		return +new Date();
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
	 *   @property {Function} easingFunc The function used to calculate the tween.  See the documentation for `Tweenable.prototype.formula` for more info on the appropriate function signature for this.
	 * @param {Object} state A configuration object containing current state data of the tween.  Required properties:
	 *   @property {Object} current The Object containing the current `Number` values of the tween.
	 */
	function tweenProps (currentPosition, params, state) {
		var prop,
			normalizedPosition;
		
		normalizedPosition = (currentPosition - params.timestamp) / params.duration;
		
		for (prop in state.current) {
			if (state.current.hasOwnProperty(prop) && params.to.hasOwnProperty(prop)) {
				state.current[prop] = params.originalState[prop] + ((params.to[prop] - params.originalState[prop]) * params.easingFunc(normalizedPosition));
			}
		}
		
		return state.current;
	}
	
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
		each(global.Tweenable.prototype.filter, function (filters, name) {
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
	 *   @property {Boolean} isAnimating Whether or not this tween as actually running.
	 *   @property {Number} loopId The property that the latest `setTimeout` invokation ID stored in.
	 */
	function timeoutHandler (params, state) {
		var currentTime;
		
		currentTime = now();
		
		if (currentTime < params.timestamp + params.duration && state.isAnimating) {
			applyFilter('beforeTween', params.owner, [state.current, params.originalState, params.to]);
			tweenProps (currentTime, params, state);		
			applyFilter('afterTween', params.owner, [state.current, params.originalState, params.to]);
			
			if (params.hook.step) {
				invokeHook('step', params.hook, params.owner, [state.current]);
			}
			
			params.step.call(state.current);
			
			// The tween is still running, schedule an update
			state.loopId = scheduleUpdate(function () {
				timeoutHandler(params, state);
			}, params.owner.fps);
		} else {
			// The duration of the tween has expired
			params.owner.stop(true);
		}
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
	function Tweenable (options) {
		options = options || {};
		
		this._hook = {};

		this._tweenParams = {
			'owner': this
			,'hook': this._hook
			,'data': {} // holds arbitrary data
		};

		this._state = {};
		
		// The state that the tween begins at.  Experimental!
		this._state.current = options.initialState || {};

		// The framerate at which Shifty updates.  This is exposed publicly as `tweenableInst.fps`.
		this.fps = options.fps || 30;

		// The default easing formula.  This is exposed publicly as `tweenableInst.easing`.
		this.easing = options.easing || 'linear';

		// The default `duration`.  This is exposed publicly as `tweenableInst.duration`.
		this.duration = options.duration || 500;
		
		return this;
	}
	
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
	 *     duration:   [Number],
	 *     callback:   [Function],
	 *     easing:     [String],
	 *     step:       [Function]
	 *   });
	 *
	 * Regardless of how you invoke this method, the only required parameters are `from` and `to`.
	 *
	 * @param {Object} from The beginning state Object containing the properties to tween from.  NOTE:  The properties of this Object are modified over time (to reflect the values in `to`).
	 * @param {Object} to The target state Object containing the properties to tween to.
	 * @param {Number} duration The amount of time in milliseconds that the tween should run for.
	 * @param {Function} callback The function to invoke as soon as this tween completes.  This function is given the tween's current state Object as the first parameter.
	 * @param {String} easing The name of the easing formula to use for this tween.  You can specify any easing fomula that was attached to `Tweenable.prototype.formula`.  If ommitted, the easing formula specified when the instance was created is used, or `linear` if that was omitted.
	 * @param {Function} step A function to call for each step of the tween.  A "step" is defined as one update cycle (frame) of the tween.  Many update cycles occur to create the illusion of motion, so this function will likely be called quite a bit.
	 */
	Tweenable.prototype.tween = function tween (from, to, duration, callback, easing) {

		var self = this;

		if (this._state.isAnimating) {
			return;
		}
		
		this._state.loopId = 0;
		this._state.pausedAtTime = null;
		
		// Normalize some internal values depending on how `tweenableInst.tween` was invoked
		if (to) {
			// Assume the shorthand syntax is being used.
			this._tweenParams.step = function () {};
			this._state.current = from || {};
			this._tweenParams.to = to || {};
			this._tweenParams.duration = duration || this.duration;
			this._tweenParams.callback = callback || function () {};
			this._tweenParams.easing = easing || this.easing;
		} else {
			// If the second argument is not present, assume the longhand syntax is being used.
			this._tweenParams.step = from.step || function () {};
			this._tweenParams.callback = from.callback || function () {};
			this._state.current = from.from || {};
			this._tweenParams.to = from.to || from.target || {};
			this._tweenParams.duration = from.duration || this.duration;
			this._tweenParams.easing = from.easing || this.easing;
		}
		
		this._tweenParams.timestamp = now();
		this._tweenParams.easingFunc = this.formula[this._tweenParams.easing] || this.formula.linear;
		
		// Ensure that there is always something to tween to.
		// Kinda dumb and slow, but makes this code way more flexible.
		weakCopy(this._state.current, this._tweenParams.to);
		weakCopy(this._tweenParams.to, this._state.current);
		
		applyFilter('tweenCreated', this._tweenParams.owner, [this._state.current, this._tweenParams.originalState, this._tweenParams.to]);
		this._tweenParams.originalState = simpleCopy({}, this._state.current);
		this._state.isAnimating = true;

		scheduleUpdate(function () {
			timeoutHandler(self._tweenParams, self._state);
		}, this.fps);
		
		return this;
	};
	
	/**
	 * Convenience method for tweening from the current position.  This method functions identically to `tween()` (it's just a wrapper function), but implicitly passes the `Tweenable` instance's current state (what you get from `get()`) as the `from` parameter.  This supports both the longhand and shorthand syntax that `tween()` does, just omitting the `from` paramter in both cases.
	 * @param {Object} target If the other parameters are omitted, this Object should contain the longhand parameters outlined in `tween()`.  If at least one other formal parameter is specified, then this Object should contain the target values to tween to.
	 * @param {Number} duration Duration of the tween, in milliseconds.
	 * @param {Function} callback The callback function to pass along to `tween()`.
	 * @param {String} easing The easing formula to use.
	 */
	Tweenable.prototype.to = function to (target, duration, callback, easing) {
		if (typeof duration === 'undefined') {
			// Shorthand notation is being used
			target.from = this.get();
			this.tween(target);
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
		this._state.isAnimating = false;
		
		if (gotoEnd) {
			simpleCopy(this._state.current, this._tweenParams.to);
			applyFilter('afterTweenEnd', this, [this._state.current, this._tweenParams.originalState, this._tweenParams.to]);
			this._tweenParams.callback.call(this._state.current);
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
		var self = this;
		
		if (this._state.isPaused) {
			this._tweenParams.timestamp += this._state.pausedAtTime - this._tweenParams.timestamp;
		}
		
		scheduleUpdate(function () {
			timeoutHandler(self._tweenParams, self._state);
		}, this.fps);
		
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
		,'applyFilter': applyFilter
		,'simpleCopy': simpleCopy
		,'weakCopy': weakCopy
	};
	
	/**
	 * This object contains all of the tweens available to Shifty.  It is extendable - simply attach properties to the Tweenable.prototype.formula Object following the same format at `linear`.
	 */
	Tweenable.prototype.formula = {
		linear: function (pos) {
			return pos;
		}
	};
	
	if (typeof global.Tweenable === 'undefined') {
		// Make `Tweenable` globally accessible.
		global.Tweenable = Tweenable;
	}
	
}(this));
