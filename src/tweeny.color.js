(function tweenyColor (global) {
	if (!global.Tweenable) {
		return;
	}
	
	global.Tweenable.prototype.filter.color = {
		'beforeTween': function pretween (currentState, fromState, toState) {
			//console.log(currentState.test, fromState.test, toState.test)
		},
		
		'afterTween': function postTween (currentState, fromState, toState) {
			
		}
	};
	
}(this));