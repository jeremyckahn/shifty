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
  Tweenable.interpolate = function (from, targetState, position, easing) /*!*/{
   // TODO: Remove shorthand version of this, only support configuration Object
   // API.
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


 /**
  * Prototype version of `Tweenable.interpolate`.  Works the same way, but you don't need to supply a `from` parameter - that is taken from the Tweenable instance.  The interpolated value is also set as the Tweenable's current state.
  *
  * Example:
  *
  * ```
  * var tweenable = new Tweenable();
  *
  * // Where to start from.  This also sets the current state of the instance.
  * tweenable.set({
  *   'top': '100px',
  *   'left': 0,
  *   'color': '#000'
  * });
  *
  * // Where to end up
  * var endObj = {
  *   'top': '200px',
  *   'left': 50,
  *   'color': '#fff'
  * };
  *
  * tweenable.interpolate(endObj, 0.5, 'linear');
  * // {left: 25, top: "150px", color: "rgb(127,127,127)"}
  * ```
  * @param {Object} targetState The ending values to tween to.
  * @param {number} position The normalized position value (between 0.0 and 1.0) to interpolate the values between `from` and `to` against.
  * @param {string|Object} easing The easing method to calculate the interpolation against.  You can use any easing method attached to `Tweenable.prototype.formula`.  If omitted, this defaults to "linear".
  * @return {Object}
  */
  Tweenable.prototype.interpolate = function (
      targetState, position, easing) /*!*/{
    var interpolatedValues;

    interpolatedValues =
        Tweenable.interpolate(this.get(), targetState, position, easing);
    this.set(interpolatedValues);

    return interpolatedValues;
  };

}());
