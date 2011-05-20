(function (global, undefined) {
	var tweeny;
	
	if (global.tweeny) {
		return;
	}
	
	global.tweeny = tweeny = {
		fps: 30,
		
		/**
		 * @param {Object} fromProps 
		 * @param {Object} toProps
		 * @param {Number} duration
		 * @param {String} easingFormula
		 */
		tween: function (fromProps, toProps, duration, easingFormula) {
			
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
		formula : {
			linear: function (t, b, c, d) {
				// no easing, no acceleration
				return c * t / d + b;
			}
		}
	};
	
})(this);