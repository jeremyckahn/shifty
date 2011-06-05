(function tweenyColor (global) {
	var R_PX = /px/i,
		savedPxPropNames;
	
	if (!global.Tweenable) {
		return;
	}
	
	function isPxString (str) {
		return typeof str === 'string' && R_PX.test(str);
	}
	
	function getPxProps (obj) {
		var list;
		
		list = [];
		
		global.Tweenable.util.each(obj, function (obj, prop) {
			if (isPxString(obj[prop])) {
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
			obj[pxPropNames[i]] = +obj[pxPropNames[i]].replace(R_PX, '');
		}
	}
	
	function rePxify (obj, pxPropNames) {
		var i,
			limit;
			
			limit = pxPropNames.length;
			
		for (i = 0; i < limit; i++) {
			obj[pxPropNames[i]] = obj[pxPropNames[i]] + 'px';
		}
	}
	
	global.Tweenable.prototype.filter.color = {
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