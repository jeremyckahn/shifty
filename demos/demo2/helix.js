/*global window:true, setTimeout:true */
(function (global) {
	var START_TIME = +(new Date())
		,CYCLE_SPEED = 1500
		,HELIX_WIDTH = 300
		,SEGMENT_BUFFER = 0.2
		,segmentContainer
		,segments
		,stepStateLists
		,i;
	
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
		
		interpolatedValue = global.Tweenable.util.interpolate({
		    from: { 'left': 0 },
		    to: { 'left': HELIX_WIDTH },
		    position: interpolator,
		    easing: 'easeInOutSine'
		}).left;
		
		if (moddedLoopPosition > 1) {
			return HELIX_WIDTH - interpolatedValue;
		} else {
			return interpolatedValue;
		}
	}
	
	function updateSegment (index, loopPosition) {
		var segment
			,calculated;
		
		segment = segments[index];
		calculated = getPosition(loopPosition, index * SEGMENT_BUFFER);
		segment.style.left = calculated + 'px';
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
	
	segmentContainer = document.getElementById('segment-container');
	//alert(segmentContainer.children.length)
	segments = segmentContainer.children;
	stepStateLists = [];
	
	for (i = 0; i < segments.length; i++) {
		stepStateLists.push([]);
	}
	
	loop();
	
} (this));