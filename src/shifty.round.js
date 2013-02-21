/**
 * Shifty Rounding Extension
 *
 * Enables number rounding for computed tween values.  For example, if at some point during an animation, the current value of property `x` is 4.6, this extension would round it up to 5.  If it was 4.3, it would be rounded down to 4.  It is disabled by default.
 */

;(function () {

  var isRoundingEnabled = false;

  /**
   * Turns rounding functionality on.
   */
  Tweenable.enableRounding = function () {
    isRoundingEnabled = true;
  };


  /**
   * Turns rounding functionality off.
   */
  Tweenable.disableRounding = function () {
    isRoundingEnabled = false;
  };


  /**
   * Returns whether rounding is enabled or not.
   * @return {boolean}
   */
  Tweenable.isRoundingEnabled = function () {
    return isRoundingEnabled;
  };


  Tweenable.prototype.filter.round = {

    'afterTween': function (currentState, fromState, toState) {

      if (isRoundingEnabled) {
        Tweenable.each(currentState, function (prop) {
          // Duck type to see if the property is a number
          if (!currentState[prop].replace) {
            currentState[prop] = Math.round(currentState[prop]);
          }
        });
      }
    }
  };

}());
