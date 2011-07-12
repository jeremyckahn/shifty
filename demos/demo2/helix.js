(function (global) {
	var segments
		,i;
	
	function getStyle(el, style) {
		return window.getComputedStyle(el).getPropertyCSSValue(style).cssText;
	}
	
	function cycle (el, callback) {
		var tweenable
			,originalLeft
			
		function toTheLeftToTheLeft (callback) {
			tweenable.queue({
				'to': {
					'left': '300px'
				}

				,'duration': 1500

				,'easing': 'easeInOutSine'

				,'step': function step () {
					el.style.left = this['left'];
				}

				,'callback': callback
			}).queue({
				'to': {
					'left': originalLeft
				}

				,'duration': 1500

				,'easing': 'easeInOutSine'

				,'step': function step () {
					el.style.left = this['left'];
				}

				,'callback': callback
			})
		}
		
		originalLeft = getStyle(el, 'left');
		
		tweenable = new Tweenable({
			'initialState': {
				'left': originalLeft
			}
			,'fps': 30
		});
		
		toTheLeftToTheLeft();
	}
	
	segments = document.getElementsByClassName('segment');
	
	for (i = 0; i < segments.length; i++) {
		(function (i) {
			setTimeout(function () {
				cycle(segments[i]);
			}, (30 * i));
		} (i));
	}
	
} (this));