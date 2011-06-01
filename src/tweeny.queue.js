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
	
	if (!global.Tweenable) {
		return;
	}

	function iterateQueue (queue) {
		queue.shift();

		if (queue.length) {
			queue[0]();
		} else {
			queue.running = false;
		}
	}
	
	function getWrappedCallback (callback, queue) {
		return function () {
			callback();
			iterateQueue(queue);
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

	global.Tweenable.prototype.queue = function (from, to, duration, callback, easing) {
		var wrappedCallback;
			
		if (!this._tweenQueue) {
			this._tweenQueue = [];
		}

		// Make sure there is always an invokable callback
		callback = callback || from.callback || function () {};
		wrappedCallback = getWrappedCallback(callback, this._tweenQueue);
		this._tweenQueue.push(tweenInit(this, from, to, duration, wrappedCallback, easing));

		if (!this._tweenQueue.running) {
			this._tweenQueue[0]();
			this._tweenQueue.running = true;
		}
	};

	global.Tweenable.prototype.queueShift = function () {
		this._tweenQueue.shift();
	};

	global.Tweenable.prototype.queueUnshift = function () {
		this._tweenQueue.unshift();
	};

	global.Tweenable.prototype.queueEmpty = function () {
		this._tweenQueue.length = 0;
	};

	global.Tweenable.prototype.queueLength = function () {
		return this._tweenQueue.length;
	};
	
}(this));