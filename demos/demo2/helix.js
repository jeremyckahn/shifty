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
			tweenable.to({
				'to': {
					'left': '300px'
				}

				,'duration': 1000

				,'easing': 'easeInOutSine'

				,'step': function step () {
					el.style.left = this['left'];
				}

				,'callback': callback
			});
		}
		
		function toTheRightToTheRight (callback) {
			tweenable.to({
				'to': {
					'left': originalLeft
				}

				,'duration': 1000

				,'easing': 'easeInOutSine'

				,'step': function step () {
					el.style.left = this['left'];
				}

				,'callback': callback
			});
		}
		
		function loop () {
			toTheLeftToTheLeft(function () {
				toTheRightToTheRight(loop);
			});
		}
		
		originalLeft = getStyle(el, 'left');
		
		tweenable = new Tweenable({
			'initialState': {
				'left': originalLeft
			}
			,'fps': 30
		});
		
		loop();
	}
	
	segments = document.getElementsByClassName('segment');
	
	for (i = 0; i < segments.length; i++) {
		(function (i) {
			setTimeout(function () {
				cycle(segments[i]);
			}, 30 * i);
		} (i));
	}
	
} (this));