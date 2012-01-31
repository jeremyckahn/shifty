/**
Shifty Rounding Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function () {

  var isRoundingEnabled = false;

  Tweenable.util.enableRounding = function () {
    isRoundingEnabled = true;
  };


  Tweenable.util.disableRounding = function () {
    isRoundingEnabled = false;
  };


  Tweenable.util.isRoundingEnabled = function () {
    return isRoundingEnabled;
  };


  Tweenable.prototype.filter.round = {

    'afterTween': function (currentState, fromState, toState) {

      if (isRoundingEnabled) {
        Tweenable.util.each(currentState, function (obj, prop) {
          obj[prop] = Math.round(obj[prop]);
        });
      }
    }
  };

}());
