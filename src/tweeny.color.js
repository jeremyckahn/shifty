(function tweenyColor (global) {
	if (!global.Tweenable) {
		return;
	}
	
	global.Tweenable.prototype.filter.color = {
		
		'beforeTween': function beforeTween (currentState, fromState, toState) {
			console.log(currentState.test, fromState.test, toState.test)
		},
		
		'afterTween': function afterTween (currentState, fromState, toState) {
			
		}
	};
	
}(this));