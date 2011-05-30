/*global setTimeout:true, clearTimeout:true */

/**
Tweeny - A teeny tiny JavaScript tweening engine
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny, please consult the manual: https://github.com/jeremyckahn/tweeny/blob/master/README.md

*/

(function (global) {
	
	/**
	 * Get the current UNIX time as an integer
	 * @returns {Number} An integer representing the current timestamp.
	 */
	function now () {
		return +new Date();
	}
	
	/**
	 * Does a basic copy of one Object's properties to another.  This is not a robust `extend` function, nor is it recusrsive.  It is only appropriate to use on objects that have primitive properties (Numbers, Strings, Boolean, etc.)
	 * @param {Object} targetObject The object to copy into
	 * @param {Object} srcObject The object to copy from
	 * @returns {Object} A reference to the augmented `targetObj` Object
	 */
	function simpleCopy (targetObj, srcObj) {
		var prop;
		
		for (prop in srcObj) {
			if (srcObj.hasOwnProperty(prop)) {
				targetObj[prop] = srcObj[prop];
			}
		}
		
		return targetObj;
	}
	
	// Modifies the `from` object
	function tweenProps (currentTime, params, state) {
		var prop;
		
		for (prop in state.current) {
			if (state.current.hasOwnProperty(prop) && params.to.hasOwnProperty(prop)) {
				state.current[prop] = params.easingFunc(currentTime - params.timestamp, params.originalState[prop], params.to[prop] - params.originalState[prop], params.duration);
			}
		}
	}
	
	function scheduleUpdate (handler, fps) {
		return setTimeout(handler, 1000 / fps);
	}
	
	function invokeHook (hookName, hooks, context, args) {
		var i;
		
		for (i = 0; i < hooks[hookName].length; i++) {
			hooks[hookName][i].apply(context, args);
		}
	}
	
	function Tween (params, state) {
		/**
		 * Stops the tween.
		 * @param {Boolean} gotoEnd If `false`, or omitted, the tween just stops at its current state, and the `callback` is not invoked.  If `true`, the tweened object's values are instantly set the the target values, and the `callbabk` is invoked.
		 */
		this.stop = function stop (gotoEnd) {
			clearTimeout(state.loopId);
			if (gotoEnd) {
				simpleCopy(state.current, params.to);
				params.callback.call(state.current);
			}
		};
		
		/**
		 * Returns a reference to the tweened object (the `from` object that wat passed to `tweeny.tween`).
		 * @returns {Object}
		 */
		this.get = function get () {
			return state.current;
		};
		
		return this;
	}
	
	function timeoutHandler (params, state) {
		var currentTime;
		
		currentTime = now();
		
		if (currentTime < params.timestamp + params.duration) {
			// The tween is still running, schedule an update
			tweenProps (currentTime, params, state);
			
			if (params.hook.step) {
				invokeHook('step', params.hook, params.context, [state.current]);
			}
			
			params.step.call(state.current);
			state.loopId = scheduleUpdate(function () {
				timeoutHandler(params, state);
			}, params.fps);
		} else {
			// The duration of the tween has expired
			params.tweenController.stop(true);
		}
	}
	
	function Tweenable () {
		var self,
			prop,
			hook;
			
		self = this;
		hook = {};
		
		// The framerate at which Tweeny updates.
		this.fps = 30;
		
		// The default easing formula.  This can be changed publicly.
		this.easing = 'linear';
		
		// The default `duration`.  This can be changed publicly.
		this.duration = 500;
		
		this.fn = {};
		
		/**
		 * @param {Object} from 
		 * @param {Object} to
		 * @param {Number} duration
		 * @param {String} easing
		 */
		this.tween = function tween (from, to, duration, callback, easing) {
			var tweenParams,
				state;
				
			tweenParams = {};
			state = {
				loopId: 0,
				current: {}
			};
			
			// Normalize some internal values depending on how `tweeny.tween` was invoked
			if (to) {
				// Assume the shorthand syntax is being used.
				tweenParams.step = function () {};
				state.current = from || {};
				tweenParams.to = to || {};
				tweenParams.duration = duration || this.duration;
				tweenParams.callback = callback || function () {};
				tweenParams.easing = easing || this.easing;
			} else {
				// If the second argument is not present, assume the longhand syntax is being used.
				tweenParams.step = from.step || function () {};
				tweenParams.callback = from.callback || function () {};
				state.current = from.from || {};
				tweenParams.to = from.to || {};
				tweenParams.duration = from.duration || this.duration;
				tweenParams.easing = from.easing || this.easing;
			}
			
			tweenParams.hook = hook;
			tweenParams.timestamp = now();
			tweenParams.easingFunc = global.tweeny.formula[easing] || global.tweeny.formula.linear;
			tweenParams.originalState = simpleCopy({}, state.current);
			tweenParams.tweenController = new Tween(tweenParams, state);

			scheduleUpdate(function () {
				timeoutHandler(tweenParams, state);
			});
			
			return tweenParams.tweenController;
		};
		
		/**
		 * This object contains all of the tweens available to Tweeny.  It is extendable - simply attach properties to the tweeny.formula Object following the same format at `linear`.
		 * 
		 * This pattern was copied from Robert Penner, under BSD License (http://www.robertpenner.com/)
		 * 
		 * @param t The current time
		 * @param b Start value
		 * @param c Change in value (delta)
		 * @param d Duration of the tween
		 */
		this.formula = {
			linear: function (t, b, c, d) {
				// no easing, no acceleration
				return c * t / d + b;
			}
		};
		
		this.hookAdd = function hookAdd (hookName, hookFunc) {
			if (!hook.hasOwnProperty(hookName)) {
				hook[hookName] = [];
			}
			
			hook[hookName].push(hookFunc);
		};
		
		this.hookRemove = function hookRemove (hookName, hookFunc) {
			var i;
			
			if (!hook.hasOwnProperty(hookName)) {
				return;
			}
			
			if (!hookFunc) {
				hook[hookName] = [];
				return;
			}
			
			for (i = hook[hookName].length; i >= 0; i++) {
				if (hook[hookName][i] === hookFunc) {
					hook[hookName].splice(i, 1);
				}
			}
		};
		
		// THIS NEEDS TO GO.
		// If tweeny has already been defined and the constructor is being called again, then tweeny is being inherited
		if (global.tweeny) {
			// Add all the extension methods that were already attached to the global `tweeny`			
			for (prop in global.tweeny.fn) {
				if (global.tweeny.fn.hasOwnProperty(prop)) {
					this.fn[prop] = global.tweeny.fn[prop];
					global.tweeny.fn[prop](this);
				}
			}

			// Add all the tween formulas that were already added
			if (global.tweeny.formula) {
				simpleCopy(this.formula, global.tweeny.formula);
			}
			
			simpleCopy(this.hook, global.tweeny.hook);
		}
		
		return this;
	}
	
	global.Tweenable = Tweenable;
	global.tweeny = new Tweenable();
	
}(this));