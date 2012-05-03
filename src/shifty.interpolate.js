/**
 * Shifty Interpolate Extension
 * By Jeremy Kahn - jeremyckahn@gmail.com
 *
 * Enables Shifty to compute single midpoints of a tween.
 */
;(function () {

  function getInterpolatedValues (from, current, to, position, easing) {
    return Tweenable.util.tweenProps(position, {
      'originalState': from
      ,'to': to
      ,'timestamp': 0
      ,'duration': 1
      ,'easing': easing
    }, {
      'current': current
    });
  }


  function expandEasingParam (stateObject, easingParam) {
    var easingObject = easingParam;

    if (typeof easingParam === 'string') {
      easingObject = {};
      Tweenable.util.each(stateObject, function (obj, prop) {
        easingObject[prop] = obj[prop];
      });
    }

    return easingObject;
  }


  // This is the static utility version of the function.
  Tweenable.util.interpolate = function (from, to, position, easing) {
    var current
        ,interpolatedValues
        ,mockTweenable;

    // Function was passed a configuration object, extract the values
    if (from && from.from) {
      to = from.to;
      position = from.position;
      easing = from.easing;
      from = from.from;
    }

    mockTweenable = new Tweenable();
    mockTweenable._tweenParams.easing = easing || 'linear';
    current = Tweenable.util.simpleCopy({}, from);
    var easingObject = Tweenable.util.composeEasingObject(
        from, mockTweenable._tweenParams.easing);

    // Call any data type filters
    Tweenable.util.applyFilter('tweenCreated', mockTweenable,
        [current, from, to, easingObject]);
    Tweenable.util.applyFilter('beforeTween', mockTweenable,
        [current, from, to, easingObject]);
    interpolatedValues = getInterpolatedValues(
        from, current, to, position, easingObject);
    Tweenable.util.applyFilter('afterTween', mockTweenable,
        [interpolatedValues, from, to, easingObject]);

    return interpolatedValues;
  };


  // This is the inheritable instance-method version of the function.
  Tweenable.prototype.interpolate = function (to, position, easing) {
    var interpolatedValues;

    interpolatedValues = Tweenable.util.interpolate(this.get(), to, position, easing);
    this.set(interpolatedValues);

    return interpolatedValues;
  };

}());
