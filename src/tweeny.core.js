/*global setTimeout:true */

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
	 * @param targetObject The object to copy into
	 * @param srcObject The object to copy from
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
		'tween': function tween (from, to, duration, easing) {
			var params,
				step,
				complete,
				loop,
				timestamp,
				easingFunc,
				fromClone;
				
			function tweenProps (currentTime) {
				var prop;
				
				for (prop in from) {
					if (from.hasOwnProperty(prop) && to.hasOwnProperty(prop)) {
						from[prop] = easingFunc(currentTime - timestamp, fromClone[prop], to[prop] - fromClone[prop], duration);
					}
				}
			}
				
			function scheduleUpdate (handler) {
				loop = setTimeout(handler, 1000 / this.fps);
			}
				
			function timeoutHandler () {
				var currentTime;
				
				currentTime = now();
				
				if (currentTime < timestamp + duration) {
					// The tween is still running, schedule an update
					tweenProps(currentTime);
					//step(from, to);
					step.call(from);
					scheduleUpdate(timeoutHandler);
				} else {
					// The duration of the tween has expired
					simpleCopy(from, to);
					complete.call(from);
				}
			}
			
			if (to) {
				// Assume the shorthand syntax is being used.
				step = function () {};
				complete = function () {};
				from = from || {};
				to = to || {};
				duration = duration || this.duration;
				easing = easing || this.easing;
			} else {
				params = from;
				
				// If the second argument is not present, assume the longhand syntax is being used.
				step = params.step || function () {};
				complete = params.complete || function () {};
				from = params.from || {};
				to = params.to || {};
				duration = params.duration || this.duration;
				easing = params.easing || this.easing;
			}
			
			timestamp = now();
			easingFunc = tweeny.formula[easing] || tweeny.formula.linear;
			fromClone = simpleCopy({}, from);
			scheduleUpdate(timeoutHandler);
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