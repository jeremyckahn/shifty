(function tweenyColor (global) {
	if (!global.Tweenable) {
		return;
	}
	
	global.Tweenable.prototype.filter.color = {
		'pretween': function pretween () {
			
		},
		
		'postTween': function postTween () {
			
		}
	};
	
}(this));