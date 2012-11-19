/*global setTimeout:true, clearTimeout:true */

/**
Shifty Simple Ease Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

Dependencies: shifty.core.js

Shifty and all official extensions are freely available under an MIT license.
For instructions on how to use Shifty and this extension, please consult the manual: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.queue.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function () {

  var formulas = Tweenable.prototype.formula;

  Tweenable.simpleEase = function (easing, position) {
    var easingMethod;

    easingMethod = formulas[easing] || formulas.linear;

    // Fake some values and return the result.
    return easingMethod(position, 0, 1, 1);
  };

}());
