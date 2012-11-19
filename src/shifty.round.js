/**
 * Shifty Rounding Extension
 * By Jeremy Kahn - jeremyckahn@gmail.com
 *
 * Enables number rounding for computed tween values.
 */

;(function () {

  var isRoundingEnabled = false;

  Tweenable.enableRounding = function () {
    isRoundingEnabled = true;
  };


  Tweenable.disableRounding = function () {
    isRoundingEnabled = false;
  };


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
