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
