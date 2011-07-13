(function (global) {
	var STEP_STATE_LIMIT = 8
		,CYCLE_SPEED = 2500
		,segments
		,stepStateLists
		,i;
	
	function getStyle(el, style) {
		return window.getComputedStyle(el).getPropertyCSSValue(style).cssText;
	}
	
	function updateStepStateList (newState, stepStateList) {
		if (stepStateList.length === STEP_STATE_LIMIT) {
			stepStateList.shift();
		}
		
		stepStateList.push(newState);
	}
	
	function updateSegment (index, tweenState) {
		var segment
			,stepStateList
			,guideStateList;
		
		segment = segments[index];
		stepStateList = stepStateLists[index];
		
		if (typeof tweenState === 'undefined') {
			guideStateList = stepStateLists[index - 1];
			tweenState = guideStateList[0];
		}
		
		updateStepStateList(tweenState, stepStateList);
		segment.style.left = tweenState;
		
		if (index < segments.length - 1) {
			updateSegment (index + 1);
		}
	}
	
	function cycle (el, callback) {
		var tweenable
			,originalLeft
			
		function toTheLeftToTheLeft (callback) {
			
			tweenable.queue({
				'to': {
					'left': '300px'
				}

				,'duration': CYCLE_SPEED / 2

				,'easing': 'easeInOutSine'

				,'step': function step () {
					updateSegment (0, this.left);
				}

				,'callback': callback
			}).queue({
				'to': {
					'left': originalLeft
				}

				,'duration': CYCLE_SPEED / 2

				,'easing': 'easeInOutSine'

				,'step': function step () {
					updateSegment (0, this.left);
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
		
		function loop () {
			toTheLeftToTheLeft(loop);
		}
		
		loop();
	}
	
	segments = document.getElementsByClassName('segment');
	stepStateLists = [];
	
	for (i = 0; i < segments.length; i++) {
		stepStateLists.push([]);
	}
	
	cycle(segments[0]);
	
} (this));