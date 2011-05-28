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
		this.tween = function (from, to, duration, callback, easing) {
			var params,
				step,
				loopId,
				timestamp,
				easingFunc,
				fromClone,
				tweenController;
				
			function tweenProps (currentTime) {
				var prop;
				
				for (prop in from) {
					if (from.hasOwnProperty(prop) && to.hasOwnProperty(prop)) {
						from[prop] = easingFunc(currentTime - timestamp, fromClone[prop], to[prop] - fromClone[prop], duration);
					}
				}
			}
				
			function scheduleUpdate (handler) {
				loopId = setTimeout(handler, 1000 / this.fps);
			}
				
			function invokeHooks (hookName, args) {
				var i;
				
				for (i = 0; i < hook[hookName].length; i++) {
					hook[hookName][i].apply(self, args);
				}
			}
				
			function timeoutHandler () {
				var currentTime;
				
				currentTime = now();
				
				if (currentTime < timestamp + duration) {
					// The tween is still running, schedule an update
					tweenProps(currentTime);
					
					if (hook.step) {
						invokeHooks('step', [from]);
					}
					
					step.call(from);
					scheduleUpdate(timeoutHandler);
				} else {
					// The duration of the tween has expired
					tweenController.stop(true);
				}
			}
			
			// Set up the tween controller methods.  This object is the return value for `tweeny.tween`.
			function Tween () {
				/**
				 * Stops the tween.
				 * @param {Boolean} gotoEnd If `false`, or omitted, the tween just stops at its current state, and the `callback` is not invoked.  If `true`, the tweened object's values are instantly set the the target values, and the `callbabk` is invoked.
				 */
				this.stop = function stop (gotoEnd) {
					clearTimeout(loopId);
					if (gotoEnd) {
						simpleCopy(from, to);
						callback.call(from);
					}
				};
				
				/**
				 * Returns a reference to the tweened object (the `from` object that wat passed to `tweeny.tween`).
				 * @returns {Object}
				 */
				this.get = function get () {
					return from;
				};
				
				return this;
			}
			
			// Normalize some internal values depending on how `tweeny.tween` was invoked
			if (to) {
				// Assume the shorthand syntax is being used.
				step = function () {};
				from = from || {};
				to = to || {};
				duration = duration || this.duration;
				callback = callback || function () {};
				easing = easing || this.easing;
			} else {
				params = from;
				
				// If the second argument is not present, assume the longhand syntax is being used.
				step = params.step || function () {};
				callback = params.callback || function () {};
				from = params.from || {};
				to = params.to || {};
				duration = params.duration || this.duration;
				easing = params.easing || this.easing;
			}
			
			timestamp = now();
			easingFunc = global.tweeny.formula[easing] || global.tweeny.formula.linear;
			fromClone = simpleCopy({}, from);
			scheduleUpdate(timeoutHandler);
			tweenController = new Tween();
			
			return tweenController;
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
		
		this.hookAdd = function (hookName, hookFunc) {
			if (!hook.hasOwnProperty(hookName)) {
				hook[hookName] = [];
			}
			
			hook[hookName].push(hookFunc);
		};
		
		this.hookRemove = function (hookName, hookFunc) {
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
		
		// If tweeny has already been defined and the constructor is being called again, than tweeny is being inherited
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
	
	global.tweeny = new Tweenable();
	
}(this));