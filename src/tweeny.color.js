(function tweenyColor (global) {
	var savedRGBPropNames;
	
	if (!global.Tweenable) {
		return;
	}
	
	/**
	 * Convert a base-16 number to base-10.
	 * @param {Number|String} hex The value to convert
	 * @returns {Number} The base-10 equivalent of `hex`.
	 */
	function hexToDec (hex) {
		return parseInt(hex, 16);
	}

	/**
	 * Convert a hexadecimal string to an array with three items, one each for the red, blue, and green decimal values.
	 * @param {String} hex A hexadecimal string.
	 * @returns {Array} The converted Array of RGB values if `hex` is a valid string, or an Array of three 0's.
	 */
	function hexToRGBArr (hex) {
		hex = hex.replace(/#/g, '');
		
		// If the string is a shorthand three digit hex notation, normalize it to the standard six digit notation
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		return [hexToDec(hex.substr(0, 2)), hexToDec(hex.substr(2, 2)), hexToDec(hex.substr(4, 2))];
	}
	
	function getRGBStringFromHex (str) {
		var rgbArr;
		
		if ((/^#([0-9]|[a-f]){3}$/i).test(str) || (/^#([0-9]|[a-f]){6}$/i).test(str)) {
			rgbArr = hexToRGBArr(str);
			str = 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
		}
		
		return str;
	}
	
	function getAndConvertStringProps (obj) {
		var stringPropNames;
		
		stringPropNames = [];
		
		global.Tweenable.util.each(obj, function (obj, prop) {
			if (typeof obj[prop] === 'string') {
				obj[prop] = getRGBStringFromHex(obj[prop]);
				stringPropNames.push(prop);
			}
		});
		
		return stringPropNames;
	}
	
	function rgbToArr (str) {
		return str.split(/\D+/g).slice(1, 4);
	}
	
	function splitRGBChunks (obj, savedRGBPropNames) {
		var i,
			limit,
			rgbParts;
			
			limit = savedRGBPropNames.length;
			
			for (i = 0; i < limit; i++) {
				rgbParts = rgbToArr(obj[savedRGBPropNames[i]]);
				obj['__r__' + savedRGBPropNames[i]] = rgbParts[0];
				obj['__g__' + savedRGBPropNames[i]] = rgbParts[1];
				obj['__b__' + savedRGBPropNames[i]] = rgbParts[2];
				delete obj[savedRGBPropNames[i]];
			}
	}
	
	global.Tweenable.prototype.filter.color = {
		'tweenCreated': function tweenCreated (fromState, toState) {
			savedRGBPropNames = getAndConvertStringProps(fromState);
			getAndConvertStringProps(toState);

			splitRGBChunks(fromState, savedRGBPropNames);
			splitRGBChunks(toState, savedRGBPropNames);
			
			//console.log(fromState, toState)
		},
		
		'beforeTween': function beforeTween (currentState, fromState, toState) {
			//console.log(currentState.test, fromState.test, toState.test)
			
		},
		
		'afterTween': function afterTween (currentState, fromState, toState) {
			
		}
	};
	
}(this));