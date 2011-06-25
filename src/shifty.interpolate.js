/*global setTimeout:true, clearTimeout:true */

/**
Shifty Interpolate Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: shifty.core.js

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny and this extension, please consult the manual: https://github.com/jeremyckahn/tweeny/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyInterpolate (global) {
	
	if (!global.Tweenable) {
		return;
	}
	
	function getInterplatedValues (from, to, position, easing) {
		return Tweenable.util.tweenProps(position, {
			'originalState': from
			,'to': to
			,'timestamp': 0
			,'duration': 1
			,'easingFunc': Tweenable.prototype.formula[easing] || Tweenable.prototype.formula.linear
		}, {
			'current': Tweenable.util.simpleCopy({}, startObj)
		});
	}

	// This is the static utility version of the function.
	global.Tweenable.util.interpolate = function (from, to, position, easing) {
		// Function was passed a configuration object, extract the values
		if (from && from.from) {
			to = from.to
			position = from.position;
			easing = from.easing;
			from = from.from;
		}
		
		return getInterplatedValues (from, to, position, easing);
	};

}(this));