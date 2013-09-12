/*! shifty - v0.12.0 - 2013-09-12 - http://jeremyckahn.github.io/shifty */
;(function (root) {

/*!
 * Shifty Core
 * By Jeremy Kahn - jeremyckahn@gmail.com
 */

// UglifyJS define hack.  Used for unit testing.  Contents of this if are
// compiled away.
if (typeof SHIFTY_DEBUG_NOW === 'undefined') {
  SHIFTY_DEBUG_NOW = function () {
    return +new Date();
  };
}

var Tweenable = (function () {

  'use strict';

  var DEFAULT_EASING = 'linear';
  var DEFAULT_DURATION = 500;
  var UPDATE_TIME = 1000 / 60;

  var _now = Date.now
      ? Date.now
      : function () { return +new Date(); };

  var now = SHIFTY_DEBUG_NOW
      ? SHIFTY_DEBUG_NOW
      : _now;

  var schedule = (function () {
    var updateMethod;

    if (typeof window !== 'undefined') {
      // requestAnimationFrame() shim by Paul Irish (modified for Shifty)
      // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      updateMethod = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || (window.mozCancelRequestAnimationFrame
            && window.mozRequestAnimationFrame)
        || setTimeout;
    } else {
      updateMethod = setTimeout;
    }

    return updateMethod;
  })();

  function noop () {
    // NOOP!
  }

  /*!
   * Handy shortcut for doing a for-in loop. This is not a "normal" each
   * function, it is optimized for Shifty.  The iterator function only receives
   * the property name, not the value.
   * @param {Object} obj
   * @param {Function(string)} fn
   */
  function each (obj, fn) {
    var key;
    for (key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        fn(key);
      }
    }
  }

  /*!
   * Perform a shallow copy of Object properties.
   * @param {Object} targetObject The object to copy into
   * @param {Object} srcObject The object to copy from
   * @return {Object} A reference to the augmented `targetObj` Object
   */
  function shallowCopy (targetObj, srcObj) {
    each(srcObj, function (prop) {
      targetObj[prop] = srcObj[prop];
    });

    return targetObj;
  }

  /*!
   * Copies each property from src onto target, but only if the property to
   * copy to target is undefined.
   * @param {Object} target Missing properties in this Object are filled in
   * @param {Object} src
   */
  function defaults (target, src) {
    each(src, function (prop) {
      if (typeof target[prop] === 'undefined') {
        target[prop] = src[prop];
      }
    });

    return target;
  }

  /*!
   * Calculates the interpolated tween values of an Object for a given
   * timestamp.
   * @param {Number} forPosition The position to compute the state for.
   * @param {Object} currentState Current state properties.
   * @param {Object} originalState: The original state properties the Object is
   * tweening from.
   * @param {Object} targetState: The destination state properties the Object
   * is tweening to.
   * @param {number} duration: The length of the tween in milliseconds.
   * @param {number} timestamp: The UNIX epoch time at which the tween began.
   * @param {Object} easing: This Object's keys must correspond to the keys in
   * targetState.
   */
  function tweenProps (forPosition, currentState, originalState, targetState,
      duration, timestamp, easing) {
    var normalizedPosition = (forPosition - timestamp) / duration;

    var prop;
    for (prop in currentState) {
      if (currentState.hasOwnProperty(prop)) {
          currentState[prop] = tweenProp(originalState[prop],
              targetState[prop], formula[easing[prop]], normalizedPosition);
      }
    }

    return currentState;
  }

  /*!
   * Tweens a single property.
   * @param {number} start The value that the tween started from.
   * @param {number} end The value that the tween should end at.
   * @param {Function} easingFunc The easing formula to apply to the tween.
   * @param {number} position The normalized position (between 0.0 and 1.0) to
   * calculate the midpoint of 'start' and 'end' against.
   * @return {number} The tweened value.
   */
  function tweenProp (start, end, easingFunc, position) {
    return start + (end - start) * easingFunc(position);
  }

  /*!
   * Applies a filter to Tweenable instance.
   * @param {Tweenable} tweenable The `Tweenable` instance to call the filter
   * upon.
   * @param {String} filterName The name of the filter to apply.
   * @param {Array} args The arguments to pass to the function in the specified
   * filter.
   */
  function applyFilter (tweenable, filterName, args) {
    var filters = Tweenable.prototype.filter;
    each(filters, function (name) {
      if (filters[name][filterName]) {
        filters[name][filterName].apply(tweenable, args);
      }
    });
  }

  var timeoutHandler_filterList = [];
  var timeoutHandler_endTime;
  var timeoutHandler_currentTime;
  var timeoutHandler_isEnded;
  /*!
   * Handles the update logic for one step of a tween.
   * @param {Tweenable} tweenable
   * @param {number} timestamp
   * @param {number} duration
   * @param {Object} currentState
   * @param {Object} originalState
   * @param {Object} targetState
   * @param {Object} easing
   * @param {Function} step
   */
  function timeoutHandler (tweenable, timestamp, duration, currentState,
      originalState, targetState, easing, step) {
    timeoutHandler_endTime = timestamp + duration;
    timeoutHandler_currentTime = Math.min(now(), timeoutHandler_endTime);
    timeoutHandler_isEnded = timeoutHandler_currentTime >= timeoutHandler_endTime;

    if (tweenable.isPlaying() && !timeoutHandler_isEnded) {
      schedule(tweenable._timeoutHandler, UPDATE_TIME);

      timeoutHandler_filterList.length = 0;
      timeoutHandler_filterList.push(currentState);
      timeoutHandler_filterList.push(originalState);
      timeoutHandler_filterList.push(targetState);
      timeoutHandler_filterList.push(easing);

      applyFilter(tweenable, 'beforeTween', timeoutHandler_filterList);
      tweenProps(timeoutHandler_currentTime, currentState, originalState,
          targetState, duration, timestamp, easing);
      applyFilter(tweenable, 'afterTween', timeoutHandler_filterList);

      step(currentState);
    } else if (timeoutHandler_isEnded) {
      step(targetState);
      tweenable.stop(true);
    }

  }


  /*!
   * Creates a fully-usable easing Object from either a string or another
   * easing Object.  If `easing` is an Object, then this function clones it and
   * fills in the missing properties with "linear".
   * @param {Object} fromTweenParams
   * @param {Object|string} easing
   */
  function composeEasingObject (fromTweenParams, easing) {
    var composedEasing = {};

    if (typeof easing === 'string') {
      each(fromTweenParams, function (prop) {
        composedEasing[prop] = easing;
      });
    } else {
      each(fromTweenParams, function (prop) {
        if (!composedEasing[prop]) {
          composedEasing[prop] = easing[prop] || DEFAULT_EASING;
        }
      });
    }

    return composedEasing;
  }

  /**
   * Tweenable constructor.  Valid parameters for `options` are:
   *
   * - __initialState__ (_Object_): The state at which the first tween should begin at.
   * @param {Object=} opt_options Configuration Object.
   * @constructor
   */
   function Tweenable (opt_options) {
    var options = opt_options || {};

    this.data = {};

    // The state that the tween begins at.
    this._currentState = options.initialState || {};

    this._timeoutHandler = null;

    return this;
  }

  /**
   * Start a tween.  `config` may have the following options (required parameters are noted):
   *
   * - __to__ (_Object_): Ending position (parameters must match `from`).  Required.
   * - __from__ (_Object=_): Starting position.  If omitted, the last computed state is used.
   * - __duration__ (_number=_): How many milliseconds to animate for.
   * - __step__ (_Function(Object)=_): Function to execute every tick.  Receives the state of the tween as the first parameter.  This function is not called on the final step of the animation, but `callback` is.
   * - __callback__ (_Function=_): Function to execute upon completion.
   * - __easing__ (_Object|string=_): Easing formula name(s) to use for the tween.
   *
   * @param {Object} config
   * @return {Tweenable}
   */
  Tweenable.prototype.tween = function (config) {

    // TODO: Rename "callback" to something like "finish."
    if (this._isTweening) {
      return;
    }

    this._pausedAtTime = null;

    this._step = config.step || noop;
    this._callback = config.callback || noop;
    this._targetState = config.to || {};
    this._duration = config.duration || DEFAULT_DURATION;
    this._currentState = config.from || this.get();

    this._timestamp = now();

    var currentState = this._currentState;
    var targetState = this._targetState;

    // Ensure that there is always something to tween to.
    // Kinda dumb and wasteful, but makes this code way more flexible.
    defaults(currentState, targetState);
    defaults(targetState, currentState);

    this._easing = composeEasingObject(
        currentState, config.easing || DEFAULT_EASING);
    var originalState = this._originalState = shallowCopy({}, currentState);
    applyFilter(this, 'tweenCreated',
        [currentState, originalState, targetState, this._easing]);

    return this.resume();
  };

  /**
   * Sets the current state.
   * @return {Object}
   */
  Tweenable.prototype.get = function () {
    return shallowCopy({}, this._currentState);
  };

  /**
   * Sets the current state.
   * @param {Object} state
   */
  Tweenable.prototype.set = function (state) {
    this._currentState = state;
  };

  /**
   * Stops and cancels a tween.
   * @param {boolean=} gotoEnd If false or omitted, the tween just stops at its current state, and the callback is not invoked.  If true, the tweened object's values are instantly set to the target values, and the `callback` is invoked.
   * @return {Tweenable}
   */
  Tweenable.prototype.stop = function (gotoEnd) {
    this._isTweening = false;
    this._isPaused = false;
    this._timeoutHandler = null;

    if (gotoEnd) {
      shallowCopy(this._currentState, this._targetState);
      applyFilter(this, 'afterTweenEnd', [this._currentState,
          this._originalState, this._targetState, this._easing]);
      this._callback.call(this._currentState, this._currentState);
    }

    // TODO: The start, step and callback hooks need to be nulled here, but
    // doing so will break the queue extension.  Restructure that extension so
    // that the tween can be cleaned up properly.

    return this;
  };

  /**
   * Pauses a tween.  Paused tweens can be resumed from the point at which they were paused.  This is different than `stop()`, as that method causes a tween to start over when it is resumed.
   * @return {Tweenable}
   */
  Tweenable.prototype.pause = function () {
    this._pausedAtTime = now();
    this._isPaused = true;
    return this;
  };

  /**
   * Resumes a paused tween.
   * @return {Tweenable}
   */
  Tweenable.prototype.resume = function () {
    if (this._isPaused) {
      this._timestamp += now() - this._pausedAtTime;
    }

    this._isPaused = false;
    this._isTweening = true;

    var self = this;
    this._timeoutHandler = function () {
      timeoutHandler(self, self._timestamp, self._duration, self._currentState,
          self._originalState, self._targetState, self._easing, self._step);
    };

    this._timeoutHandler();

    return this;
  };

  /**
   * Returns whether or not a tween is running.
   * @return {boolean}
   */
  Tweenable.prototype.isPlaying = function () {
    return this._isTweening && !this._isPaused;
  };

  /*!
   * Filters are used for transforming the properties of a tween at various
   * points in a Tweenable's lifecycle.  Please consult the README for more
   * info on this.
   */
  Tweenable.prototype.filter = {};

  shallowCopy(Tweenable, {
    'now': now
    ,'each': each
    ,'tweenProps': tweenProps
    ,'tweenProp': tweenProp
    ,'applyFilter': applyFilter
    ,'shallowCopy': shallowCopy
    ,'defaults': defaults
    ,'composeEasingObject': composeEasingObject
  });

  /*!
   * This object contains all of the tweens available to Shifty.  It is extendable - simply attach properties to the Tweenable.prototype.formula Object following the same format at linear.
   */
  Tweenable.prototype.formula = {
    linear: function (pos) {
      return pos;
    }
  };

  var formula = Tweenable.prototype.formula;

  // A hook used for unit testing.
  if (typeof SHIFTY_DEBUG_NOW === 'function') {
    root.timeoutHandler = timeoutHandler;
  }

  if (typeof exports === 'object') {
    // nodejs
    module.exports = Tweenable;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () { return Tweenable; });
  } else if (typeof root.Tweenable === 'undefined') {
    // Browser: Make `Tweenable` globally accessible.
    root.Tweenable = Tweenable;
  }

  return Tweenable;

} ());

/*!
 * Shifty Easing Formulas:
 *
 * All equations are adapted from Thomas Fuchs' [Scripty2](https://raw.github.com/madrobby/scripty2/master/src/effects/transitions/penner.js).
 *
 * Based on Easing Equations (c) 2003 [Robert Penner](http://www.robertpenner.com/), all rights reserved. This work is [subject to terms](http://www.robertpenner.com/easing_terms_of_use.html).
 */

;(function () {

  Tweenable.shallowCopy(Tweenable.prototype.formula, {
    easeInQuad: function(pos){
       return Math.pow(pos, 2);
    },

    easeOutQuad: function(pos){
      return -(Math.pow((pos-1), 2) -1);
    },

    easeInOutQuad: function(pos){
      if ((pos/=0.5) < 1) {return 0.5*Math.pow(pos,2);}
      return -0.5 * ((pos-=2)*pos - 2);
    },

    easeInCubic: function(pos){
      return Math.pow(pos, 3);
    },

    easeOutCubic: function(pos){
      return (Math.pow((pos-1), 3) +1);
    },

    easeInOutCubic: function(pos){
      if ((pos/=0.5) < 1) {return 0.5*Math.pow(pos,3);}
      return 0.5 * (Math.pow((pos-2),3) + 2);
    },

    easeInQuart: function(pos){
      return Math.pow(pos, 4);
    },

    easeOutQuart: function(pos){
      return -(Math.pow((pos-1), 4) -1);
    },

    easeInOutQuart: function(pos){
      if ((pos/=0.5) < 1) {return 0.5*Math.pow(pos,4);}
      return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    },

    easeInQuint: function(pos){
      return Math.pow(pos, 5);
    },

    easeOutQuint: function(pos){
      return (Math.pow((pos-1), 5) +1);
    },

    easeInOutQuint: function(pos){
      if ((pos/=0.5) < 1) {return 0.5*Math.pow(pos,5);}
      return 0.5 * (Math.pow((pos-2),5) + 2);
    },

    easeInSine: function(pos){
      return -Math.cos(pos * (Math.PI/2)) + 1;
    },

    easeOutSine: function(pos){
      return Math.sin(pos * (Math.PI/2));
    },

    easeInOutSine: function(pos){
      return (-0.5 * (Math.cos(Math.PI*pos) -1));
    },

    easeInExpo: function(pos){
      return (pos===0) ? 0 : Math.pow(2, 10 * (pos - 1));
    },

    easeOutExpo: function(pos){
      return (pos===1) ? 1 : -Math.pow(2, -10 * pos) + 1;
    },

    easeInOutExpo: function(pos){
      if(pos===0) {return 0;}
      if(pos===1) {return 1;}
      if((pos/=0.5) < 1) {return 0.5 * Math.pow(2,10 * (pos-1));}
      return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
    },

    easeInCirc: function(pos){
      return -(Math.sqrt(1 - (pos*pos)) - 1);
    },

    easeOutCirc: function(pos){
      return Math.sqrt(1 - Math.pow((pos-1), 2));
    },

    easeInOutCirc: function(pos){
      if((pos/=0.5) < 1) {return -0.5 * (Math.sqrt(1 - pos*pos) - 1);}
      return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
    },

    easeOutBounce: function(pos){
      if ((pos) < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    easeInBack: function(pos){
      var s = 1.70158;
      return (pos)*pos*((s+1)*pos - s);
    },

    easeOutBack: function(pos){
      var s = 1.70158;
      return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
    },

    easeInOutBack: function(pos){
      var s = 1.70158;
      if((pos/=0.5) < 1) {return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));}
      return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
    },

    elastic: function(pos) {
      return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
    },

    swingFromTo: function(pos) {
      var s = 1.70158;
      return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
      0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
    },

    swingFrom: function(pos) {
      var s = 1.70158;
      return pos*pos*((s+1)*pos - s);
    },

    swingTo: function(pos) {
      var s = 1.70158;
      return (pos-=1)*pos*((s+1)*pos + s) + 1;
    },

    bounce: function(pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    bouncePast: function(pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    easeFromTo: function(pos) {
      if ((pos/=0.5) < 1) {return 0.5*Math.pow(pos,4);}
      return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    },

    easeFrom: function(pos) {
      return Math.pow(pos,4);
    },

    easeTo: function(pos) {
      return Math.pow(pos,0.25);
    }
  });

}());

/*!
 * The Bezier magic in this file is adapted/copied almost wholesale from
 * [Scripty2](http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h),
 * which was adapted from Apple code (which probably came from
 * [here](http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h)).
 * Special thanks to Apple and Thomas Fuchs for much of this code.
 */

/*!
 *  Copyright (c) 2006 Apple Computer, Inc. All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice,
 *  this list of conditions and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder(s) nor the names of any
 *  contributors may be used to endorse or promote products derived from
 *  this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 *  FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 *  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
;(function(){
  // port of webkit cubic bezier handling by http://www.netzgesta.de/dev/
  function cubicBezierAtTime(t,p1x,p1y,p2x,p2y,duration) {
    var ax=0,bx=0,cx=0,ay=0,by=0,cy=0;
    function sampleCurveX(t) {return ((ax*t+bx)*t+cx)*t;}
    function sampleCurveY(t) {return ((ay*t+by)*t+cy)*t;}
    function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;}
    function solveEpsilon(duration) {return 1.0/(200.0*duration);}
    function solve(x,epsilon) {return sampleCurveY(solveCurveX(x,epsilon));}
    function fabs(n) {if(n>=0) {return n;}else {return 0-n;}}
    function solveCurveX(x,epsilon) {
      var t0,t1,t2,x2,d2,i;
      for(t2=x, i=0; i<8; i++) {x2=sampleCurveX(t2)-x; if(fabs(x2)<epsilon) {return t2;} d2=sampleCurveDerivativeX(t2); if(fabs(d2)<1e-6) {break;} t2=t2-x2/d2;}
      t0=0.0; t1=1.0; t2=x; if(t2<t0) {return t0;} if(t2>t1) {return t1;}
      while(t0<t1) {x2=sampleCurveX(t2); if(fabs(x2-x)<epsilon) {return t2;} if(x>x2) {t0=t2;}else {t1=t2;} t2=(t1-t0)*0.5+t0;}
      return t2; // Failure.
    }
    cx=3.0*p1x; bx=3.0*(p2x-p1x)-cx; ax=1.0-cx-bx; cy=3.0*p1y; by=3.0*(p2y-p1y)-cy; ay=1.0-cy-by;
    return solve(t, solveEpsilon(duration));
  }
  /*!
   *  getCubicBezierTransition(x1, y1, x2, y2) -> Function
   *
   *  Generates a transition easing function that is compatible
   *  with WebKit's CSS transitions `-webkit-transition-timing-function`
   *  CSS property.
   *
   *  The W3C has more information about
   *  <a href="http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag">
   *  CSS3 transition timing functions</a>.
   *
   *  @param {number} x1
   *  @param {number} y1
   *  @param {number} x2
   *  @param {number} y2
   *  @return {function}
   */
  function getCubicBezierTransition (x1, y1, x2, y2){
    return function(pos){
      return cubicBezierAtTime(pos,x1,y1,x2,y2,1);
    };
  }
  // End ported code

  /**
   * Creates a Bezier easing function and attaches it to `Tweenable.prototype.formula`.  This function gives you total control over the easing curve.  Matthew Lein's [Ceaser](http://matthewlein.com/ceaser/) is a useful tool for visualizing the curves you can make with this function.
   *
   * @param {string} name The name of the easing formula.  Overwrites the old easing formula on Tweenable.prototype.formula if it exists.
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @return {function} The easing function that was attached to Tweenable.prototype.formula.
   */
  Tweenable.setBezierFunction = function (name, x1, y1, x2, y2) {
    return Tweenable.prototype.formula[name] =
      getCubicBezierTransition(x1, y1, x2, y2);
  };


  /**
   * `delete`s an easing formula from `Tweenable.prototype.formula`.  Be careful with this method, as it `delete`s whatever easing formula matches `name` (so you can delete default Shifty easing formulae).
   *
   * @param {string} name The name of the easing formula to delete.
   * @return {function}
   */
  Tweenable.unsetBezierFunction = function (name) {
    delete Tweenable.prototype.formula[name];
  };

})();

/*!
 * Shifty Interpolate Extension:
 *
 * Enables Shifty to compute single midpoints of a tween.
 */
;(function () {

  function getInterpolatedValues (
      from, current, targetState, position, easing) {
    return Tweenable.tweenProps(
        position, current, from, targetState, 1, 0, easing);
  }


  var filterList = [];
 /**
  * Compute the midpoint of two Objects.  This method effectively calculates a specific frame of animation that Tweenable#tween does over a sequence.
  *
  * Example:
  *
  * ```
  *  var interpolatedValues = Tweenable.interpolate({
  *    width: '100px',
  *    opacity: 0,
  *    color: '#fff'
  *  }, {
  *    width: '200px',
  *    opacity: 1,
  *    color: '#000'
  *  }, 0.5);
  *
  *  console.log(interpolatedValues);
  *  // {opacity: 0.5, width: "150px", color: "rgb(127,127,127)"}
  * ```
  *
  * @param {Object} from The starting values to tween from.
  * @param {Object} targetState The ending values to tween to.
  * @param {number} position The normalized position value (between 0.0 and 1.0) to interpolate the values between `from` and `to` against.
  * @param {string|Object} easing The easing method to calculate the interpolation against.  You can use any easing method attached to `Tweenable.prototype.formula`.  If omitted, this defaults to "linear".
  * @return {Object}
  */
  Tweenable.interpolate = function (from, targetState, position, easing) {
    // TODO: Could this be moved outside of this function and reused, rather
    // than be re-initialized?
    var mockTweenable = new Tweenable();

    var current = Tweenable.shallowCopy({}, from);
    var easingObject = Tweenable.composeEasingObject(
        from, easing || 'linear');

    filterList[0] = current;
    filterList[1] = from;
    filterList[2] = targetState;
    filterList[3] = easingObject;

    // Call any data type filters
    Tweenable.applyFilter(mockTweenable, 'tweenCreated', filterList);
    Tweenable.applyFilter(mockTweenable, 'beforeTween', filterList);

    filterList[0] = getInterpolatedValues(
        from, current, targetState, position, easingObject);

    Tweenable.applyFilter(mockTweenable, 'afterTween', filterList);

    return filterList[0];
  };

}());

/**
 * Shifty Token Extension:
 *
 * Adds string interpolation support to Shifty.
 *
 * The Token extension allows Shifty to tween numbers inside of strings.  This is nice because it allows you to animate CSS properties.  For example, you can do this:
 *
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { transform: 'translateX(45px)'},
 *   to: { transform: 'translateX(90xp)'},
 *   duration: 1000
 * });
 * ```
 *
 * ...And `translateX(45)` will be tweened to `translateX(90)`.  To demonstrate...
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { transform: 'translateX(45px)'},
 *   to: { transform: 'translateX(90px)'},
 *   duration: 100,
 *   step: function (state) {
 *     console.log(state.transform);
 *   }
 * });
 * ```
 *
 * Will log something like this in the console...
 * ```
 * translateX(60.3px)
 * translateX(76.05px)
 * translateX(90px)
 * ```
 *
 * Another use for this is animating colors...
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { color: 'rgb(0,255,0)'},
 *   to: { color: 'rgb(255,0,255)'},
 *   duration: 100,
 *   step: function (state) {
 *     console.log(state.color);
 *   }
 * });
 * ```
 *
 * Logs something like...
 * ```
 * rgb(84,170,84)
 * rgb(170,84,170)
 * rgb(255,0,255)
 * ```
 *
 * This extension also supports hex colors, in both long (`#ff00ff`) and short (`#f0f`) forms.  Note that the extension converts hex input to the equivalent RGB output values.  This is done to optimize for performance.
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { color: '#0f0'},
 *   to: { color: '#f0f'},
 *   duration: 100,
 *   step: function (state) {
 *     console.log(state.color);
 *   }
 * });
 * ```
 *
 * Yields...
 * ```
 * rgb(84,170,84)
 * rgb(170,84,170)
 * rgb(255,0,255)
 * ```
 *
 * Same as before.
 *
 *
 * Easing support:
 *
 * Easing works somewhat differently in the Token extension.  This is because some CSS properties have multiple values in them, and you might want to have each value tween with an independent easing formula.  A basic example...
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { transform: 'translateX(0px) translateY(0px)'},
 *   to: { transform:   'translateX(100px) translateY(100px)'},
 *   duration: 100,
 *   easing: { transform: 'easeInQuad' },
 *   step: function (state) {
 *     console.log(state.transform);
 *   }
 * });
 * ```
 *
 * Gives results like this...
 * ```
 * translateX(11.560000000000002px) translateY(11.560000000000002px)
 * translateX(46.24000000000001px) translateY(46.24000000000001px)
 * translateX(100px) translateY(100px)
 * ```
 *
 * Note that the values for `translateX` and `translateY` are always the same for each step of the tween, because they have the same start and end points and both use the same easing formula.  But we can also do this...
 * ```
 * var tweenable = new Tweenable();
 * tweenable.tween({
 *   from: { transform: 'translateX(0px) translateY(0px)'},
 *   to: { transform:   'translateX(100px) translateY(100px)'},
 *   duration: 100,
 *   easing: { transform: 'easeInQuad bounce' },
 *   step: function (state) {
 *     console.log(state.transform);
 *   }
 * });
 * ```
 *
 * And get an output like this...
 * ```
 * translateX(10.89px) translateY(82.355625px)
 * translateX(44.89000000000001px) translateY(86.73062500000002px)
 * translateX(100px) translateY(100px)
 * ```
 *
 * `translateX` and `translateY` are not in sync anymore, because we specified the `easeInQuad` formula for `translateX` and `bounce` for `translateY`.  Mixing and matching easing formulae can make for some interesting curves in your animations.
 *
 * The order of the space-separated easing formulas correspond the token values they apply to.  If there are more token values than easing formulae, the last easing formula listed is used.
 */
 function token () {
   // Functionality for this extension runs implicitly if it is loaded.
 } /*!*/

;(function (Tweenable) {

  /*!
   * @typedef {{
   *   formatString: string
   *   chunkNames: Array.<string>
   * }}
   */
  var formatManifest;


  // CONSTANTS

  var R_FORMAT_CHUNKS = /([^\-0-9\.]+)/g;
  var R_UNFORMATTED_VALUES = /[0-9.\-]+/g;
  var R_RGB = new RegExp(
      'rgb\\(' + R_UNFORMATTED_VALUES.source +
      (/,\s*/.source) + R_UNFORMATTED_VALUES.source +
      (/,\s*/.source) + R_UNFORMATTED_VALUES.source + '\\)', 'g');
  var R_RGB_PREFIX = /^.*\(/;
  var R_HEX = /#([0-9]|[a-f]){3,6}/g;
  var VALUE_PLACEHOLDER = 'VAL';


  // HELPERS

  var getFormatChunksFrom_accumulator = [];
  /*!
   * @param {Array.number} rawValues
   * @param {string} prefix
   *
   * @return {Array.<string>}
   */
  function getFormatChunksFrom (rawValues, prefix) {
    getFormatChunksFrom_accumulator.length = 0;

    var rawValuesLength = rawValues.length;
    var i;

    for (i = 0; i < rawValuesLength; i++) {
      getFormatChunksFrom_accumulator.push('_' + prefix + '_' + i);
    }

    return getFormatChunksFrom_accumulator;
  }


  /*!
   * @param {string} formattedString
   *
   * @return {string}
   */
  function getFormatStringFrom (formattedString) {
    var chunks = formattedString.match(R_FORMAT_CHUNKS);

    if (chunks.length === 1) {
      chunks.unshift('');
    }

    return chunks.join(VALUE_PLACEHOLDER);
  }


  /*!
   * Convert all hex color values within a string to an rgb string.
   *
   * @param {Object} stateObject
   *
   * @return {Object} The modified obj
   */
  function sanitizeObjectForHexProps (stateObject) {
    Tweenable.each(stateObject, function (prop) {
      var currentProp = stateObject[prop];

      if (typeof currentProp === 'string' && currentProp.match(R_HEX)) {
        stateObject[prop] = sanitizeHexChunksToRGB(currentProp);
      }
    });
  }


  /*!
   * @param {string} str
   *
   * @return {string}
   */
  function  sanitizeHexChunksToRGB (str) {
    return filterStringChunks(R_HEX, str, convertHexToRGB);
  }


  /*!
   * @param {string} hexString
   *
   * @return {string}
   */
  function convertHexToRGB (hexString) {
    var rgbArr = hexToRGBArray(hexString);
    return 'rgb(' + rgbArr[0] + ',' + rgbArr[1] + ',' + rgbArr[2] + ')';
  }


  var hexToRGBArray_returnArray = [];
  /*!
   * Convert a hexadecimal string to an array with three items, one each for
   * the red, blue, and green decimal values.
   *
   * @param {string} hex A hexadecimal string.
   *
   * @returns {Array.<number>} The converted Array of RGB values if `hex` is a
   * valid string, or an Array of three 0's.
   */
  function hexToRGBArray (hex) {

    hex = hex.replace(/#/, '');

    // If the string is a shorthand three digit hex notation, normalize it to
    // the standard six digit notation
    if (hex.length === 3) {
      hex = hex.split('');
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    hexToRGBArray_returnArray[0] = hexToDec(hex.substr(0, 2));
    hexToRGBArray_returnArray[1] = hexToDec(hex.substr(2, 2));
    hexToRGBArray_returnArray[2] = hexToDec(hex.substr(4, 2));

    return hexToRGBArray_returnArray;
  }


  /*!
   * Convert a base-16 number to base-10.
   *
   * @param {Number|String} hex The value to convert
   *
   * @returns {Number} The base-10 equivalent of `hex`.
   */
  function hexToDec (hex) {
    return parseInt(hex, 16);
  }


  /*!
   * Runs a filter operation on all chunks of a string that match a RegExp
   *
   * @param {RegExp} pattern
   * @param {string} unfilteredString
   * @param {function(string)} filter
   *
   * @return {string}
   */
  function filterStringChunks (pattern, unfilteredString, filter) {
    var pattenMatches = unfilteredString.match(pattern);
    var filteredString = unfilteredString.replace(pattern, VALUE_PLACEHOLDER);

    if (pattenMatches) {
      var pattenMatchesLength = pattenMatches.length;
      var currentChunk;

      for (var i = 0; i < pattenMatchesLength; i++) {
        currentChunk = pattenMatches.shift();
        filteredString = filteredString.replace(
            VALUE_PLACEHOLDER, filter(currentChunk));
      }
    }

    return filteredString;
  }


  /*!
   * Check for floating point values within rgb strings and rounds them.
   *
   * @param {string} formattedString
   *
   * @return {string}
   */
  function sanitizeRGBChunks (formattedString) {
    return filterStringChunks(R_RGB, formattedString, sanitizeRGBChunk);
  }


  /*!
   * @param {string} rgbChunk
   *
   * @return {string}
   */
  function sanitizeRGBChunk (rgbChunk) {
    var numbers = rgbChunk.match(R_UNFORMATTED_VALUES);
    var numbersLength = numbers.length;
    var sanitizedString = rgbChunk.match(R_RGB_PREFIX)[0];

    for (var i = 0; i < numbersLength; i++) {
      sanitizedString += parseInt(numbers[i], 10) + ',';
    }

    sanitizedString = sanitizedString.slice(0, -1) + ')';

    return sanitizedString;
  }


  /*!
   * @param {Object} stateObject
   *
   * @return {Object} An Object of formatManifests that correspond to
   * the string properties of stateObject
   */
  function getFormatManifests (stateObject) {
    var manifestAccumulator = {};

    Tweenable.each(stateObject, function (prop) {
      var currentProp = stateObject[prop];

      if (typeof currentProp === 'string') {
        var rawValues = getValuesFrom(currentProp);

        manifestAccumulator[prop] = {
          'formatString': getFormatStringFrom(currentProp)
          ,'chunkNames': getFormatChunksFrom(rawValues, prop)
        };
      }
    });

    return manifestAccumulator;
  }


  /*!
   * @param {Object} stateObject
   * @param {Object} formatManifests
   */
  function expandFormattedProperties (stateObject, formatManifests) {
    Tweenable.each(formatManifests, function (prop) {
      var currentProp = stateObject[prop];
      var rawValues = getValuesFrom(currentProp);
      var rawValuesLength = rawValues.length;

      for (var i = 0; i < rawValuesLength; i++) {
        stateObject[formatManifests[prop].chunkNames[i]] = +rawValues[i];
      }

      delete stateObject[prop];
    });
  }


  /*!
   * @param {Object} stateObject
   * @param {Object} formatManifests
   */
  function collapseFormattedProperties (stateObject, formatManifests) {
    Tweenable.each(formatManifests, function (prop) {
      var currentProp = stateObject[prop];
      var formatChunks = extractPropertyChunks(
          stateObject, formatManifests[prop].chunkNames);
      var valuesList = getValuesList(
          formatChunks, formatManifests[prop].chunkNames);
      currentProp = getFormattedValues(
          formatManifests[prop].formatString, valuesList);
      stateObject[prop] = sanitizeRGBChunks(currentProp);
    });
  }


  /*!
   * @param {Object} stateObject
   * @param {Array.<string>} chunkNames
   *
   * @return {Object} The extracted value chunks.
   */
  function extractPropertyChunks (stateObject, chunkNames) {
    var extractedValues = {};
    var currentChunkName, chunkNamesLength = chunkNames.length;

    for (var i = 0; i < chunkNamesLength; i++) {
      currentChunkName = chunkNames[i];
      extractedValues[currentChunkName] = stateObject[currentChunkName];
      delete stateObject[currentChunkName];
    }

    return extractedValues;
  }


  var getValuesList_accumulator = [];
  /*!
   * @param {Object} stateObject
   * @param {Array.<string>} chunkNames
   *
   * @return {Array.<number>}
   */
  function getValuesList (stateObject, chunkNames) {
    getValuesList_accumulator.length = 0;
    var chunkNamesLength = chunkNames.length;

    for (var i = 0; i < chunkNamesLength; i++) {
      getValuesList_accumulator.push(stateObject[chunkNames[i]]);
    }

    return getValuesList_accumulator;
  }


  /*!
   * @param {string} formatString
   * @param {Array.<number>} rawValues
   *
   * @return {string}
   */
  function getFormattedValues (formatString, rawValues) {
    var formattedValueString = formatString;
    var rawValuesLength = rawValues.length;

    for (var i = 0; i < rawValuesLength; i++) {
      formattedValueString = formattedValueString.replace(
          VALUE_PLACEHOLDER, +rawValues[i].toFixed(4));
    }

    return formattedValueString;
  }


  /*!
   * Note: It's the duty of the caller to convert the Array elements of the
   * return value into numbers.  This is a performance optimization.
   *
   * @param {string} formattedString
   *
   * @return {Array.<string>|null}
   */
  function getValuesFrom (formattedString) {
    return formattedString.match(R_UNFORMATTED_VALUES);
  }


  /*!
   * @param {Object} easingObject
   * @param {Object} tokenData
   */
  function expandEasingObject (easingObject, tokenData) {
    Tweenable.each(tokenData, function (prop) {
      var currentProp = tokenData[prop];
      var chunkNames = currentProp.chunkNames;
      var chunkLength = chunkNames.length;
      var easingChunks = easingObject[prop].split(' ');
      var lastEasingChunk = easingChunks[easingChunks.length - 1];

      for (var i = 0; i < chunkLength; i++) {
        easingObject[chunkNames[i]] = easingChunks[i] || lastEasingChunk;
      }

      delete easingObject[prop];
    });
  }


  /*!
   * @param {Object} easingObject
   * @param {Object} tokenData
   */
  function collapseEasingObject (easingObject, tokenData) {
    Tweenable.each(tokenData, function (prop) {
      var currentProp = tokenData[prop];
      var chunkNames = currentProp.chunkNames;
      var chunkLength = chunkNames.length;
      var composedEasingString = '';

      for (var i = 0; i < chunkLength; i++) {
        composedEasingString += ' ' + easingObject[chunkNames[i]];
        delete easingObject[chunkNames[i]];
      }

      easingObject[prop] = composedEasingString.substr(1);
    });
  }


  Tweenable.prototype.filter.token = {
    'tweenCreated': function (currentState, fromState, toState, easingObject) {
      sanitizeObjectForHexProps(currentState);
      sanitizeObjectForHexProps(fromState);
      sanitizeObjectForHexProps(toState);
      this._tokenData = getFormatManifests(currentState);
    },

    'beforeTween': function (currentState, fromState, toState, easingObject) {
      expandEasingObject(easingObject, this._tokenData);
      expandFormattedProperties(currentState, this._tokenData);
      expandFormattedProperties(fromState, this._tokenData);
      expandFormattedProperties(toState, this._tokenData);
    },

    'afterTween': function (currentState, fromState, toState, easingObject) {
      collapseFormattedProperties(currentState, this._tokenData);
      collapseFormattedProperties(fromState, this._tokenData);
      collapseFormattedProperties(toState, this._tokenData);
      collapseEasingObject(easingObject, this._tokenData);
    }
  };

} (Tweenable));

}(this));
