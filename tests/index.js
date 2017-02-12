/* global describe:true, it:true, beforeEach:true, afterEach:true */
import assert from 'assert';

import {
  Tweenable,
  interpolate,
  setBezierFunction,
  unsetBezierFunction
} from '../src/main';

const now = Tweenable.now;

describe('shifty', function () {
  let tweenable, state;

  function forceInternalUpdate () {
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

  describe('Tweenable', () => {
    beforeEach(() => {
      tweenable = new Tweenable();
    });

    afterEach(() => {
      tweenable = undefined;
      state = undefined;
      Tweenable.now = now;
    });

    it('can accept initial state', function () {
      tweenable = new Tweenable({ x: 5 });

      Tweenable.now = _ => 0;
      tweenable.tween({
        to: { x: 10 }
        ,duration: 1000
        ,step: function (_state) {
          state = _state;
        }
      });

      Tweenable.now = _ => 500;
      forceInternalUpdate();
      assert.equal(state.x, 7.5,
        'data provided to the constuctor was used as "from" state');
    });

    describe('#tween', () => {
      it('Midpoints of a tween are correctly computed', function () {
        Tweenable.now = _ => 0;
        tweenable.tween({
          from: { x: 0 }
          ,to: { x: 100 }
          ,duration: 1000
        });

        assert.equal(tweenable.get().x, 0, 'The tween starts at 0');
        Tweenable.now = _ => 500;
        forceInternalUpdate();
        assert.equal(tweenable.get().x, 50,
            'The middle of the tween equates to .5 of the target value');
        Tweenable.now = _ => 1000;
        forceInternalUpdate();
        assert.equal(tweenable.get().x, 100,
            'The end of the tween equates to 1.0 of the target value');
        Tweenable.now = _ => 100000;
        forceInternalUpdate();
        assert.equal(tweenable.get().x, 100,
            'Anything after end of the tween equates to 1.0 of the target value');
      });
    });
  });
});
