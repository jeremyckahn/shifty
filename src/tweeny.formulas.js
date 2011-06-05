// All equations are copied from here: http://www.gizma.com/easing/
// Originally written by Robert Penner, copied under BSD License (http://www.robertpenner.com/)
//
// Params are as follows:
// t = current time
// b = start value
// c = change in value
// d = duration
Tweenable.prototype.formula.easeInQuad = function (t, b, c, d) {
	t /= d;
	return c * t * t + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t * (t - 2) + b;
};

// acceleration until halfway, then deceleration
Tweenable.prototype.formula.easeInOutQuad = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t + b;
	}
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInCubic = function (t, b, c, d) {
	t /= d;
	return c * t * t * t + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutCubic = function (t, b, c, d) {
	t /= d;
	t--;
	return c * (t * t * t + 1) + b;
};

// acceleration until halfway, then deceleration
Tweenable.prototype.formula.easeInOutCubic = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t * t + b;
	}
	t -= 2;
	return c / 2 * (t * t * t + 2) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c * t * t * t * t + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutQuart = function (t, b, c, d) {
	t /= d;
	t--;
	return -c * (t * t * t * t - 1) + b;
};

// acceleration until halfway, then deceleration
Tweenable.prototype.formula.easeInOutQuart = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t * t * t + b;
	}
	t -= 2;
	return -c / 2 * (t * t * t * t - 2) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInQuint = function (t, b, c, d) {
	t /= d;
	return c * t * t * t * t * t + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutQuint = function (t, b, c, d) {
	t /= d;
	t--;
	return c * (t * t * t * t * t + 1) + b;
};

// acceleration until halfway, then deceleration
Tweenable.prototype.formula.easeInOutQuint = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * t * t * t * t * t + b;
	}
	t -= 2;
	return c / 2 * (t * t * t * t * t + 2) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInSine = function (t, b, c, d) {
	return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutSine = function (t, b, c, d) {
	return c * Math.sin(t / d * (Math.PI / 2)) + b;
};

// accelerating until halfway, then decelerating
Tweenable.prototype.formula.easeInOutSine = function (t, b, c, d) {
	return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInExpo = function (t, b, c, d) {
	return c * Math.pow(2, 10 * (t / d - 1)) + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutExpo = function (t, b, c, d) {
	return c * (-Math.pow(2, -10 * t / d) + 1) + b;
};

// accelerating until halfway, then decelerating
Tweenable.prototype.formula.easeInOutExpo = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
	}
	t--;
	return c / 2 * (-Math.pow(2, -10 * t) + 2) + b;
};

// accelerating from zero velocity
Tweenable.prototype.formula.easeInCirc = function (t, b, c, d) {
	t /= d;
	return -c * (Math.sqrt(1 - t * t) - 1) + b;
};

// decelerating to zero velocity
Tweenable.prototype.formula.easeOutCirc = function (t, b, c, d) {
	t /= d;
	t--;
	return c * Math.sqrt(1 - t * t) + b;
};

// acceleration until halfway, then deceleration
Tweenable.prototype.formula.easeInOutCirc = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) {
		return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
	}
	t -= 2;
	return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
};
