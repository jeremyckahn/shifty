/*global setTimeout:true, clearTimeout:true */

/**
Shifty Interpolate Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: shifty.core.js

Tweeny and all official extensions are freely available under an MIT license.
For instructions on how to use Tweeny and this extension, please consult the manual: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyInterpolate (global) {
  
  if (!global.Tweenable) {
    return;
  }
  
  function getInterpolatedValues (from, current, to, position, easing) {
    return global.Tweenable.util.tweenProps(position, {
      'originalState': from
      ,'to': to
      ,'timestamp': 0
      ,'duration': 1
      ,'easingFunc': global.Tweenable.prototype.formula[easing] || global.Tweenable.prototype.formula.linear
    }, {
      'current': current
    });
  }

  // This is the static utility version of the function.
  global.Tweenable.util.interpolate = function (from, to, position, easing) {
    var current,
      interpolatedValues;
    
    // Function was passed a configuration object, extract the values
    if (from && from.from) {
      to = from.to;
      position = from.position;
      easing = from.easing;
      from = from.from;
    }
    
    current = global.Tweenable.util.simpleCopy({}, from);
    
    // Call any data type filters
    global.Tweenable.util.applyFilter('tweenCreated', current, [current, from, to]);
    global.Tweenable.util.applyFilter('beforeTween', current, [current, from, to]);
    interpolatedValues = getInterpolatedValues (from, current, to, position, easing);
    global.Tweenable.util.applyFilter('afterTween', interpolatedValues, [interpolatedValues, from, to]);
    
    return interpolatedValues;
  };
  
  // This is the inheritable instance-method version of the function.
  global.Tweenable.prototype.interpolate = function (to, position, easing) {
    var interpolatedValues;
    
    interpolatedValues = global.Tweenable.util.interpolate(this.get(), to, position, easing);
    this.set(interpolatedValues);
    
    return interpolatedValues;
  };
}(this));
