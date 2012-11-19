/*global setTimeout:true, clearTimeout:true */

/**
Shifty Clamp Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: shifty.core.js

Shifty and all official extensions are freely available under an MIT license.
For instructions on how to use Shifty and this extension, please consult the manual: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/
(function () {

  var staticClamp;

  if (!Tweenable) {
    return;
  }

  function applyClampsToState (state) {
    var clamps;

    // Combine both the static clamps and instance clamps.  Instance clamps trump Static clamps, if there is a conflict.
    // The first part of the check is ugly, because this may have been called statically.
    clamps = Tweenable.defaults(
      ((this._tweenParams && this._tweenParams.data.clamps) || {}), staticClamp.clamps);

    Tweenable.each(clamps, function (prop) {
      if (state.hasOwnProperty(prop)) {
        state[prop] = Math.max(state[prop], clamps[prop].bottom);
        state[prop] = Math.min(state[prop], clamps[prop].top);
      }
    });
  }

  // Static versions of the clamp methods.  These set clamps for all tweens made by `Tweenable`.
  // If an instance of `Tweenable` has a clamp on a property, and different clamp has been set
  // statically on the same propety, only the instance clamp is respected.
  staticClamp = Tweenable.setClamp = function (propertyName, bottomRange, topRange) {
    staticClamp.clamps[propertyName] = {
      'bottom': bottomRange
      ,'top': topRange
    };
  };

  Tweenable.removeClamp = function (propertyName) {
    return delete staticClamp.clamps[propertyName];
  };

  // This is the inheritable instance-method version of the function.
  Tweenable.prototype.setClamp = function (propertyName, bottomRange, topRange) {
    if (!this._tweenParams.data.clamps) {
      this._tweenParams.data.clamps = {};
    }

    this._tweenParams.data.clamps[propertyName] = {
      'bottom': bottomRange
      ,'top': topRange
    };
  };

  Tweenable.prototype.removeClamp = function (propertyName) {
    return delete this._tweenParams.data.clamps[propertyName];
  };

  Tweenable.prototype.filter.clamp = {
    'afterTween': applyClampsToState

    ,'afterTweenEnd': applyClampsToState
  };

  staticClamp.clamps = {};

}());
