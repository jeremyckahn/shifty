(function (global) {
	var me
		,tweener
		,originalColor
		,originalFontSize;
	
	function getStyle (el, style) {
		var ret
			,styleWords;
		
		if (window.getComputedStyle) {
			ret = window.getComputedStyle(el).getPropertyCSSValue(style).cssText;
		} else {
			// For IE
			styleWords = style.split('-');
			if (styleWords.length === 2) {
				// ugly!
				style = styleWords[0];
				style += styleWords[1].match(/^./)[0].toUpperCase();
				style += styleWords[1].split('').slice(1).join('');
			}
			
			ret = el.currentStyle[style];
		}
		
		return ret;
	}

	function grow (callback) {
		tweener.to({
			'to': {
				'font-size': '200px'
			}

			,'duration': 600

			,'easing': 'easeOutBounce'

			,'step': function step () {
				me.style.fontSize = this['font-size'];
			}

			,'callback': callback
		});
	}

	function fade (callback) {
		tweener.to({
			'to': {
				'color': '#bada55'
			}

			,'duration': 800

			,'easing': 'easeOutExpo'

			,'step': function step () {
				me.style.color = this['color'];
			}

			,'callback': callback
		});
	}
	
	me = document.getElementById('shift-me');
	originalFontSize = originalColor = getStyle(me, 'font-size');
	originalColor = getStyle(me, 'color');

	tweener = new Tweenable({
		'initialState': {
			'font-size': originalFontSize
			,'color': originalColor
		}
		
		,'fps': 60
	});
	
	grow(function () {
		fade();
	});
	
} (this));