(function (global) {
	var START_TIME = +(new Date())
		,STEP_STATE_LIMIT = 16
		,CYCLE_SPEED = 1500
		,HELIX_WIDTH = 300
		,SEGMENT_BUFFER = .2
		,segments
		,stepStateLists
		,i;
	
	function getStyle (el, style) {
		return window.getComputedStyle(el).getPropertyCSSValue(style).cssText;
	}
	
	function now () {
		return +(new Date());
	}
	
	function getPosition (loopPosition, startBuffer) {
		var moddedLoopPosition
			,interpolator
			,interpolatedValue;
		
		if ((loopPosition - startBuffer) < 0) {
			return 0;
		}
		
		interpolator = moddedLoopPosition = ((loopPosition - startBuffer) % 2);
		
		if (moddedLoopPosition > 1) {
			interpolator = moddedLoopPosition - 1;
		}	
		
		interpolatedValue = Tweenable.util.interpolate({
		    from: { 'left': 0 },
		    to: { 'left': HELIX_WIDTH },
		    position: interpolator,
		    easing: 'easeInOutSine'
		});
		
		if (moddedLoopPosition > 1) {
			return {
				'left': HELIX_WIDTH - interpolatedValue.left
			}
		} else {
			return interpolatedValue;
		}
	}
	
	function updateSegment (index, loopPosition) {
		var segment
			,calculated;
		
		segment = segments[index];
		calculated = getPosition (loopPosition, index * SEGMENT_BUFFER);
		segment.style.left = calculated.left + 'px';
	}
	
	function updateSegments (timeSinceStart, callback) {
		var i
			,timeDelta
			,normalizedTime;
		
		timeDelta = now() - timeSinceStart;
		normalizedTime = timeDelta / CYCLE_SPEED;
		
		for (i = 0; i < segments.length; i++) {
			updateSegment(i, normalizedTime);
		}
		
		callback();
	}
	
	function loop () {
		setTimeout(function () {
			updateSegments(START_TIME, loop);
		}, 1000 / 60);
	}
	
	segments = document.getElementsByClassName('segment');
	stepStateLists = [];
	
	for (i = 0; i < segments.length; i++) {
		stepStateLists.push([]);
	}
	
	loop();
	
} (this));