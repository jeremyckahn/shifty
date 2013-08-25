/*global setTimeout:true, clearTimeout:true */

/**
 * Shifty Clamp Extension
 *
 * Use case:
 *
 * Sometimes, when generating a tween dynamically, you want to "clamp" the outputted values, or restrict them to be within a certain range.
 *
 * Example:
 *
 * ````javascript
 * var myTweenable = new Tweenable();
 *
 * myTweenable.setClamp('test', 0, 1);
 *
 * myTweenable.tween({
 *    from: {
 *     'test': -3
 *    },
 *    to: {
 *      'test': 5
 *    },
 *    'duration': 1000,
 *    'step': function (state) {
 *      console.log(state.test);
 *    },
 *    'callback': function () {
 *      console.log('Done!  Final value: ' + this.test);
 *      console.log(myTweenable.removeClamp('test'));
 *    }
 * });
 * ````
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
      this.data.clamps || {}, staticClamp.clamps);

    Tweenable.each(clamps, function (prop) {
      if (state.hasOwnProperty(prop)) {
        state[prop] = Math.max(state[prop], clamps[prop].bottom);
        state[prop] = Math.min(state[prop], clamps[prop].top);
      }
    });
  }

  /**
   * Static method.  Sets clamps for all tweens made by `Tweenable`.  If an instance of `Tweenable` has a clamp on a property, and different clamp has been set statically on the same propety, only the instance clamp is respected.
   * @param {string} propertyName The name of the tweened property to clamp.
   * @param {number} bottomRange The smallest allowed value for propertyName.
   * @param {number} topRange The largest allowed value for propertyName.
   */
  Tweenable.setClamp = function (propertyName, bottomRange, topRange) {
    staticClamp.clamps[propertyName] = {
      'bottom': bottomRange
      ,'top': topRange
    };
  };

  staticClamp = Tweenable.setClamp;

  /**
   * Static method.  Removes a property clamp.
   * @param {string} propertyName The property to remove the clamp for.
   * @return {boolean} Whether or not the operation succeeded.
   */
  Tweenable.removeClamp = function (propertyName) {
    return delete staticClamp.clamps[propertyName];
  };

  /**
   * Prototype version of `Tweenable.setClamp`.
   * @param {string} propertyName The name of the tweened property to clamp.
   * @param {number} bottomRange The smallest allowed value for propertyName.
   * @param {number} topRange The largest allowed value for propertyName.
   */
  Tweenable.prototype.setClamp = function (propertyName, bottomRange, topRange) {
    if (!this.data.clamps) {
      this.data.clamps = {};
    }

    this.data.clamps[propertyName] = {
      'bottom': bottomRange
      ,'top': topRange
    };
  };

  /**
   * Protoype version of `Tweenable.removeClamp`.
   * @param {string} propertyName The property to remove the clamp for.
   * @return {boolean} Whether or not the operation succeeded.
   */
  Tweenable.prototype.removeClamp = function (propertyName) {
    return delete this.data.clamps[propertyName];
  };

  Tweenable.prototype.filter.clamp = {
    'afterTween': applyClampsToState
    ,'afterTweenEnd': applyClampsToState
  };

  staticClamp.clamps = {};

}());
