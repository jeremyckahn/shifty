/*global setTimeout:true, clearTimeout:true */

/**
Shifty Interplate Extension
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

	global.Tweenable.prototype.interpolate = function (from, to, position, easing) {
		return Tweenable.util.tweenProps(position, {
			'originalState': from
			,'to': to
			,'timestamp': 0
			,'duration': 1
			,'easingFunc': Tweenable.prototype.formula[easing] || Tweenable.prototype.formula.linear
		}, {
			'current': Tweenable.util.simpleCopy({}, startObj)
		});
	};

}(this));