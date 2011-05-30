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

	queues = {
		'default': []
	};
	
	currentQueueName = 'default';

	Tweenable.prototype.queue = function (from, to, duration, callback, easing) {
		var queue,
			closuredQueueName,
			self;

		function wrappedCallback () {
			callback();
			iterateQueue(closuredQueueName);
		}

		function tweenInit () {
			if (to) {
				self.tween(from, to, duration, wrappedCallback, easing);
			} else {
				from.callback = wrappedCallback;
				self.tween(from);
			}
		}

		self = this;

		// Make sure there is always an invokable callback
		callback = callback || from.callback || function () {};

		closuredQueueName = currentQueueName;
		queue = queues[closuredQueueName];
		queue.push(tweenInit);

		if (!queue.running) {
			queue[0]();
			queue.running = true;
		}
	};

	Tweenable.prototype.queueName = function ( name ) {
		currentQueueName = name;

		if (!queues[currentQueueName]) {
			queues[currentQueueName] = [];
		}

		return currentQueueName;
	};

	Tweenable.prototype.queueShift = function () {
		queues[currentQueueName].shift();
	};

	Tweenable.prototype.queueUnshift = function () {
		queues[currentQueueName].unshift();
	};

	Tweenable.prototype.queueEmpty = function () {
		queues[currentQueueName].length = 0;
	};

	Tweenable.prototype.queueLength = function () {
		return queues[currentQueueName].length;
	};
	
}(this));