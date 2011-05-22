/*global setTimeout:true, clearTimeout:true */

/**
Tweeny - A teeny tiny JavaScript tweening engine
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny, please consult the manual: https://github.com/jeremyckahn/tweeny/blob/master/README.md

*/

(function (global) {
	var tweeny;
	
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
	
	if (global.tweeny) {
		return;
	}
	
	global.tweeny = tweeny = {
		// The framerate at which Tweeny updates.
		'fps': 30,
		
		// The default easing formula.  This can be changed publicly.
		'easing': 'linear',
		
		// The default `duration`.  This can be changed publicly.
		'duration': 500,
		
		/**
		 * @param {Object} from 
		 * @param {Object} to
		 * @param {Number} duration
		 * @param {String} easing
		 */
		'tween': function tween (from, to, duration, callback, easing) {
			var params,
				step,
				callback,
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
				
			function timeoutHandler () {
				var currentTime;
				
				currentTime = now();
				
				if (currentTime < timestamp + duration) {
					// The tween is still running, schedule an update
					tweenProps(currentTime);
					step.call(from);
					scheduleUpdate(timeoutHandler);
				} else {
					// The duration of the tween has expired
					tweenController.stop(true);
				}
			}
			
			// Set up the tween controller methods.  This object is the return value for `tweeny.tween`.
			tweenController = {
				/**
				 * Stops the tween.
				 * @param {Boolean} gotoEnd If `false`, or omitted, the tween just stops at its current state, and the `callback` is not invoked.  If `true`, the tweened object's values are instantly set the the target values, and the `callbabk` is invoked.
				 */
				'stop': function stop (gotoEnd) {
					clearTimeout(loopId);
					if (gotoEnd) {
						simpleCopy(from, to);
						callback.call(from);
					}
				},
				
				/**
				 * Returns a reference to the tweened object (the `from` object that wat passed to `tweeny.tween`).
				 * @returns {Object}
				 */
				'get': function get () {
					return from;
				}
			};
			
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
			easingFunc = tweeny.formula[easing] || tweeny.formula.linear;
			fromClone = simpleCopy({}, from);
			scheduleUpdate(timeoutHandler);
			
			return tweenController;
		},
		
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
		'formula' : {
			linear: function (t, b, c, d) {
				// no easing, no acceleration
				return c * t / d + b;
			}
		}
	};
	
}(this));