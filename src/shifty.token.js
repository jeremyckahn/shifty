/**
Shifty Token Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/tweeny/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.px.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

/*
What needs to happen:

Before the tween, evaluate all tween props and determine if they match a token string pattern.  If so, convert them to numbers.  After the tween, restore the saved props to their original format.

*/

(function shiftyPx (global) {
	var R_VALID_FORMATS = /(px$|em$|%$|pc$|pt$|mm$|cm$|in$|ex$)/i,
		savedPxPropNames;
	
	function isValidString (str) {
		return typeof str === 'string' && R_VALID_FORMATS.test(str);
	}
	
	function getPxProps (obj) {
		var list;
		
		list = [];
		
		global.Tweenable.util.each(obj, function (obj, prop) {
			if (isValidString(obj[prop])) {
				list.push(prop);
			}
		});
		
		return list;
	}
	
	function dePxify (obj, pxPropNames) {
		var i,
			limit;
			
			limit = pxPropNames.length;
			
		for (i = 0; i < limit; i++) {
			obj[pxPropNames[i]] = +obj[pxPropNames[i]].replace(R_VALID_FORMATS, '');
		}
	}
	
	function rePxify (obj, pxPropNames) {
		var i,
			limit;
			
			limit = pxPropNames.length;
			
		for (i = 0; i < limit; i++) {
			obj[pxPropNames[i]] = Math.floor(obj[pxPropNames[i]]) + 'px';
		}
	}
	
	global.Tweenable.prototype.filter.px = {
		'beforeTween': function beforeTween (currentState, fromState, toState) {
			savedPxPropNames = getPxProps(fromState);
			
			dePxify(currentState, savedPxPropNames);
			dePxify(fromState, savedPxPropNames);
			dePxify(toState, savedPxPropNames);
		},
		
		'afterTween': function afterTween (currentState, fromState, toState) {
			rePxify(currentState, savedPxPropNames);
			rePxify(fromState, savedPxPropNames);
			rePxify(toState, savedPxPropNames);
		}
	};
	
}(this));