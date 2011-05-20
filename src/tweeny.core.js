(function (global, undefined) {
	var tweeny;
	
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
				complete;
			
			if (toProps) {
				// Assume the shorthand syntax is being used.
				step = function () {};
				complete = function () {};
				from = params.from || {};
				to = to || {};
				duration = duration || this.duration;
				easing = easing || this.easing;
			} else {
				params = fromProps;
				
				// If the second argument is not present, assume the longhand syntax is being used.
				step = params.step || function () {};
				complete = params.complete || function () {};
				from = params.from || {};
				to = params.to || {};
				duration = params.duration || this.duration;
				easing = params.easing || this.easing;
			}
			
			
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
	
})(this);