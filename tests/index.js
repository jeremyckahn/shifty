/* global describe:true, it: true */
import assert from 'assert';

import {
  Tweenable,
  interpolate,
  setBezierFunction,
  unsetBezierFunction
} from '../src/main';

function forceInternalUpdate (tweenable) {
  Tweenable._timeoutHandler(tweenable,
    tweenable._timestamp,
    tweenable._delay,
    tweenable._duration,
    tweenable._currentState,
    tweenable._originalState,
    tweenable._targetState,
    tweenable._easing,
    tweenable._step,
    _ => _ // schedule
  );
}

describe('shifty', function () {
  describe('Tweenable', () => {
    it('can accept initial state', function () {
      var tweenable = new Tweenable({ x: 5 });
      var state;

      Tweenable.now = _ => 0;
      tweenable.tween({
        to: { x: 10 }
        ,duration: 1000
        ,step: function (_state) {
          state = _state;
        }
      });

      Tweenable.now = _ => 500;
      forceInternalUpdate(tweenable);
      assert.equal(state.x, 7.5,
        'data provided to the constuctor was used as "from" state');
    });
  });
});
