(function tweenyColor (global) {
	var R_SHORTHAND_HEX = /^#([0-9]|[a-f]){3}$/i,
		R_LONGHAND_HEX = /^#([0-9]|[a-f]){6}$/i,
		R_RGB = /^rgb\(\d+\s*,\d+\s*,\d+\s*\)\s*$/i,
		savedRGBPropNames;
	
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
		var rgbArr,
			convertedStr;
		
		rgbArr = hexToRGBArr(str);
		convertedStr = 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
		
		return convertedStr;
	}
	
	function isColorString (str) {
		return (typeof str === 'string') && (R_SHORTHAND_HEX.test(str) || R_LONGHAND_HEX.test(str) || R_RGB.test(str));
	}
	
	function isHexString (str) {
		return (typeof str === 'string') && (R_SHORTHAND_HEX.test(str) || R_LONGHAND_HEX.test(str));
	}
	
	function convertHexStringPropsToRGB (obj) {
		global.Tweenable.util.each(obj, function (obj, prop) {
			if (isHexString(obj[prop])) {
				obj[prop] = getRGBStringFromHex(obj[prop]);
			}
		});
	}
	
	function getColorStringPropNames (obj) {
		var list;
		
		list = [];
		
		global.Tweenable.util.each(obj, function (obj, prop) {
			if (isColorString(obj[prop])) {
				list.push(prop);
			}
		});
		
		return list;
	}
	
	/*function rgbToArr (str) {
		return str.split(/\D+/g).slice(1, 4);
	}*/
	
	function rgbToArr (str) {
		var splitStr;
		
		splitStr = str.split(/\D+/g);
		
		// Really terriblw workaround for the way IE handles the RegEx above.
		// There's probably a better way to do this.
		if (splitStr.length > 3) {
			splitStr = splitStr.slice(1, 4);
		}
		
		return splitStr;
	}
	
	function splitRGBChunks (obj, rgbPropNames) {
		var i,
			limit,
			rgbParts;
			
			limit = rgbPropNames.length;
			
			for (i = 0; i < limit; i++) {
				rgbParts = rgbToArr(obj[rgbPropNames[i]]);
				obj['__r__' + rgbPropNames[i]] = +rgbParts[0];
				obj['__g__' + rgbPropNames[i]] = +rgbParts[1];
				obj['__b__' + rgbPropNames[i]] = +rgbParts[2];
				delete obj[rgbPropNames[i]];
			}
	}
	
	function joinRGBChunks (obj, rgbPropNames) {
		var i,
			limit;
			
		limit = rgbPropNames.length;
		
		for (i = 0; i < limit; i++) {
			
			obj[rgbPropNames[i]] = 'rgb(' + 
				parseInt(obj['__r__' + rgbPropNames[i]], 10) + ',' + 
				parseInt(obj['__g__' + rgbPropNames[i]], 10) + ',' + 
				parseInt(obj['__b__' + rgbPropNames[i]], 10) + ')';
			
			delete obj['__r__' + rgbPropNames[i]];
			delete obj['__g__' + rgbPropNames[i]];
			delete obj['__b__' + rgbPropNames[i]];
		}
	}
	
	global.Tweenable.prototype.filter.color = {
		'tweenCreated': function tweenCreated (currentState, fromState, toState) {
			convertHexStringPropsToRGB(currentState);
			convertHexStringPropsToRGB(fromState);
			convertHexStringPropsToRGB(toState);
		},
		
		'beforeTween': function beforeTween (currentState, fromState, toState) {
			savedRGBPropNames = getColorStringPropNames(fromState);
			
			splitRGBChunks(currentState, savedRGBPropNames);
			splitRGBChunks(fromState, savedRGBPropNames);
			splitRGBChunks(toState, savedRGBPropNames);
		},
		
		'afterTween': function afterTween (currentState, fromState, toState) {
			joinRGBChunks(currentState, savedRGBPropNames);
			joinRGBChunks(fromState, savedRGBPropNames);
			joinRGBChunks(toState, savedRGBPropNames);
		}
	};
	
}(this));