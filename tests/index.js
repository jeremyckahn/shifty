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
      it('midpoints of a tween are correctly computed', function () {
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

      it('step handler receives timestamp offset', function () {
        Tweenable.now = _ => 0;
        var capturedOffset;
        tweenable.tween({
          from: { x: 0 }
          ,to: { x: 100 }
          ,duration: 1000
          ,step: function (state, attachment, offset) {
            capturedOffset = offset;
          }
        });

        Tweenable.now = _ => 500;
        forceInternalUpdate();
        assert.equal(capturedOffset, 500,
          'The offset was passed along to the step handler');
      });

      describe('custom easing functions', () => {
        let easingFn = pos => pos * 2;

        it('can be given an easing function directly', function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 }
            ,to: { x: 10 }
            ,duration: 1000
            ,easing: easingFn
          });

          assert.equal(tweenable.get().x, 0,
            'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 10,
            'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 20,
            'The easing curve is used at the end of the tween');
        });

        it('can be given an Object of easing functions directly',
            function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 }
            ,to: { x: 10 }
            ,duration: 1000
            ,easing: { x: easingFn }
          });

          assert.equal(tweenable.get().x, 0,
            'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 10,
            'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 20,
            'The easing curve is used at the end of the tween');
        });

        it('supports tokens', () => {
          Tweenable.now = _ => 0;
          easingFn = pos => pos;
          tweenable.tween({
            from: { x: 'rgb(0,0,0)' }
            ,to: { x: 'rgb(255,255,255)' }
            ,duration: 1000
            ,easing: { x: easingFn }
          });

          assert.equal(tweenable.get().x, 'rgb(0,0,0)',
              'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 'rgb(127,127,127)',
              'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 'rgb(255,255,255)',
              'The easing curve is used at the end of the tween');
        });
      });

      describe('#pause', () => {
        it('moves the end time of the tween', function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 50,
              'Pre-pause: The middle of the tween equates to .5 of the target value');
          tweenable.pause();

          Tweenable.now = _ => 2000;
          tweenable.resume();
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 50,
              'The tween has not changed in the time that it has been paused');

          Tweenable.now = _ => 2500;
          forceInternalUpdate();
          assert.equal(tweenable.get().x, 100,
              'The tween ends at the modified end time');
        });
      });

      describe('#seek', () => {
        it('forces the tween to a specific point on the timeline', function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          tweenable.seek(500);
          assert.equal(tweenable._timestamp, -500, 'The timestamp was properly offset');
        });

        it('provides correct value to step handler via seek() (issue #77)', function () {
          var computedX;
          var tweenable = new Tweenable(null, {
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
            step: function (state) {
              computedX = state.x;
            }
          });

          tweenable.seek(500);
          assert.equal(computedX, 50, 'Step handler got correct state value');
        });

        it('The seek() parameter cannot be less than 0', function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          tweenable.seek(-500);
          assert.equal(tweenable._timestamp, 0, 'The seek() parameter was forced to 0');
        });

        it('no-ops if seeking to the current millisecond', function () {
          var stepHandlerCallCount = 0;
          Tweenable.now = _ => 0;

          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
            step: function () {
              stepHandlerCallCount++;
            }
          });

          tweenable.seek(50);
          tweenable.stop();
          tweenable.seek(50);
          assert.equal(stepHandlerCallCount, 1,
            'The second seek() call did not trigger any handlers');
        });

        it('keeps time reference (rel #60)', function () {
          var tweenable = new Tweenable({}, {
            from: { x: 0 },
            to: { x: 100 },
            duration: 100
          });

          // express a delay in time between the both time it's called
          // TODO: This could probably be written in a much clearer way.
          Tweenable.now = function () {
            Tweenable.now = function () {return 100;};
            return 98;
          };

          var callCount = 0;
          tweenable.stop = function () {
            callCount += 1;
          };

          tweenable.seek(98);
          assert.equal(callCount, 0, 'stop should not have been called');
        });
      });
    });
  });
});
