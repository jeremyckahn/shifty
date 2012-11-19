/**
 * Shifty Interpolate Extension
 * By Jeremy Kahn - jeremyckahn@gmail.com
 *
 * Enables Shifty to compute single midpoints of a tween.
 */
;(function () {

  function getInterpolatedValues (
      from, current, targetState, position, easing) {
    return Tweenable.tweenProps(
        position, current, from, targetState, 1, 0, easing);
  }


  function expandEasingParam (stateObject, easingParam) {
    var easingObject = easingParam;

    if (typeof easingParam === 'string') {
      easingObject = {};
      Tweenable.each(stateObject, function (prop) {
        easingObject[prop] = stateObject[prop];
      });
    }

    return easingObject;
  }


  // This is the static utility version of the function.
  Tweenable.interpolate = function (from, targetState, position, easing) {
    var current
        ,interpolatedValues
        ,mockTweenable;

    // Function was passed a configuration object, extract the values
    if (from && from.from) {
      targetState = from.to;
      position = from.position;
      easing = from.easing;
      from = from.from;
    }

    mockTweenable = new Tweenable();
    mockTweenable.easing = easing || 'linear';
    current = Tweenable.shallowCopy({}, from);
    var easingObject = Tweenable.composeEasingObject(
        from, mockTweenable.easing);

    // Call any data type filters
    Tweenable.applyFilter(mockTweenable, 'tweenCreated',
        [current, from, targetState, easingObject]);
    Tweenable.applyFilter(mockTweenable, 'beforeTween',
        [current, from, targetState, easingObject]);
    interpolatedValues = getInterpolatedValues(
        from, current, targetState, position, easingObject);
    Tweenable.applyFilter(mockTweenable, 'afterTween',
        [interpolatedValues, from, targetState, easingObject]);

    return interpolatedValues;
  };


  // This is the inheritable instance-method version of the function.
  Tweenable.prototype.interpolate = function (targetState, position, easing) {
    var interpolatedValues;

    interpolatedValues =
        Tweenable.interpolate(this.get(), targetState, position, easing);
    this.set(interpolatedValues);

    return interpolatedValues;
  };

}());
