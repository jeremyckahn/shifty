/*global setTimeout:true, clearTimeout:true */

/**
Tweeny Queue Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: tweeny.core.js

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny and this extension, please consult the manual: https://github.com/jeremyckahn/tweeny/blob/master/README.md

*/

(function tweenyQueue (global) {
	
	var currentQueueName,
		queues;
	
	if (!global.Tweenable) {
		return;
	}

	function iterateQueue (queueName) {
		var queue; 

		queue = queues[queueName];
		queue.shift();

		if (queue.length) {
			queue[0]();
		} else {
			queue.running = false;
		}
	}
	
	function getWrappedCallback (callback, queueName) {
		return function () {
			callback();
			iterateQueue(queueName);
		};
	}
	
	function tweenInit (context, from, to, duration, callback, easing) {
		return function () {
			if (to) {
				context.tween(from, to, duration, callback, easing);
			} else {
				from.callback = callback;
				context.tween(from);
			}
		};
	}

	queues = {
		'default': []
	};
	
	currentQueueName = 'default';

	global.Tweenable.prototype.queue = function (from, to, duration, callback, easing) {
		var queue,
			wrappedCallback;

		// Make sure there is always an invokable callback
		callback = callback || from.callback || function () {};
		wrappedCallback = getWrappedCallback(callback, currentQueueName);
		
		queue = queues[currentQueueName];
		queue.push(tweenInit(this, from, to, duration, wrappedCallback, easing));

		if (!queue.running) {
			queue[0]();
			queue.running = true;
		}
	};

	global.Tweenable.prototype.queueName = function ( name ) {
		currentQueueName = name;

		if (!queues[currentQueueName]) {
			queues[currentQueueName] = [];
		}

		return currentQueueName;
	};

	global.Tweenable.prototype.queueShift = function () {
		queues[currentQueueName].shift();
	};

	global.Tweenable.prototype.queueUnshift = function () {
		queues[currentQueueName].unshift();
	};

	global.Tweenable.prototype.queueEmpty = function () {
		queues[currentQueueName].length = 0;
	};

	global.Tweenable.prototype.queueLength = function () {
		return queues[currentQueueName].length;
	};
	
}(this));