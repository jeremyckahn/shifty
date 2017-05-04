/* global describe:true, it:true, before:true, beforeEach:true, afterEach:true */
import Promised from 'bluebird';
import assert from 'assert';

import {
  Tweenable,
  tween,
  interpolate,
  setBezierFunction,
  unsetBezierFunction
} from '../src/main';

import * as shifty from '../src/main';

// Handy for testing in the browser console
if (typeof window !== 'undefined') {
  window.shifty = shifty;
}

const now = Tweenable.now;

describe('shifty', () => {
  let tweenable, state;

  describe('Tweenable', () => {
    beforeEach(() => {
      tweenable = new Tweenable();
    });

    afterEach(() => {
      tweenable = undefined;
      state = undefined;
      Tweenable.now = now;
    });

    it('can accept initial state', () => {
      tweenable = new Tweenable({ x: 5 });

      Tweenable.now = _ => 0;
      tweenable.tween({
        to: { x: 10 },
        duration: 1000,
        step: function (_state) {
          state = _state;
        }
      });

      Tweenable.now = _ => 500;
      tweenable._timeoutHandler();
      assert.equal(state.x, 7.5,
        'data provided to the constuctor was used as "from" state');
    });

    describe('#tween', () => {
      it('midpoints of a tween are correctly computed', () => {
        Tweenable.now = _ => 0;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          duration: 1000
        });

        assert.equal(tweenable.get().x, 0, 'The tween starts at 0');
        Tweenable.now = _ => 500;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 50,
          'The middle of the tween equates to .5 of the target value');
        Tweenable.now = _ => 1000;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 100,
          'The end of the tween equates to 1.0 of the target value');
        Tweenable.now = _ => 100000;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 100,
          'Anything after end of the tween equates to 1.0 of the target value');
      });

      it('step handler receives timestamp offset', () => {
        Tweenable.now = _ => 0;
        let capturedOffset;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          duration: 1000,
          step: function (state, attachment, offset) {
            capturedOffset = offset;
          }
        });

        Tweenable.now = _ => 500;
        tweenable._timeoutHandler();
        assert.equal(capturedOffset, 500,
          'The offset was passed along to the step handler');
      });

      describe('custom easing functions', () => {
        let easingFn = pos => pos * 2;

        it('can be given an easing function directly', () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 10 },
            duration: 1000,
            easing: easingFn
          });

          assert.equal(tweenable.get().x, 0,
            'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 10,
            'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 20,
            'The easing curve is used at the end of the tween');
        });

        it('can be given an Object of easing functions directly',
            () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 10 },
            duration: 1000,
            easing: { x: easingFn }
          });

          assert.equal(tweenable.get().x, 0,
            'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 10,
            'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 20,
            'The easing curve is used at the end of the tween');
        });

        it('supports tokens', () => {
          Tweenable.now = _ => 0;
          easingFn = pos => pos;
          tweenable.tween({
            from: { x: 'rgb(0,0,0)' },
            to: { x: 'rgb(255,255,255)' },
            duration: 1000,
            easing: { x: easingFn }
          });

          assert.equal(tweenable.get().x, 'rgb(0,0,0)',
              'The easing curve is used at the beginning of the tween');

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 'rgb(127,127,127)',
              'The easing curve is used at the middle of the tween');

          Tweenable.now = _ => 1000;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 'rgb(255,255,255)',
              'The easing curve is used at the end of the tween');
        });
      });

      describe('#pause', () => {
        it('moves the end time of the tween', () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 50,
              'Pre-pause: The middle of the tween equates to .5 of the target value');
          tweenable.pause();

          Tweenable.now = _ => 2000;
          tweenable.resume();
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 50,
              'The tween has not changed in the time that it has been paused');

          Tweenable.now = _ => 2500;
          tweenable._timeoutHandler();
          assert.equal(tweenable.get().x, 100,
              'The tween ends at the modified end time');
        });
      });

      describe('#seek', () => {
        it('forces the tween to a specific point on the timeline', () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          tweenable.seek(500);
          assert.equal(tweenable._timestamp, -500, 'The timestamp was properly offset');
        });

        it('provides correct value to step handler via seek() (issue #77)', () => {
          let computedX;
          tweenable = new Tweenable(null, {
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

        it('The seek() parameter cannot be less than 0', () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          tweenable.seek(-500);
          assert.equal(tweenable._timestamp, 0, 'The seek() parameter was forced to 0');
        });

        it('no-ops if seeking to the current millisecond', () => {
          let stepHandlerCallCount = 0;
          Tweenable.now = _ => 0;

          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
            step: () => {
              stepHandlerCallCount++;
            }
          });

          tweenable.seek(50);
          tweenable.stop();
          tweenable.seek(50);
          assert.equal(stepHandlerCallCount, 1,
            'The second seek() call did not trigger any handlers');
        });

        it('keeps time reference (rel #60)', () => {
          tweenable = new Tweenable({}, {
            from: { x: 0 },
            to: { x: 100 },
            duration: 100
          });

          // express a delay in time between the both time it's called
          // TODO: This could probably be written in a much clearer way.
          Tweenable.now = () => {
            Tweenable.now = () => {return 100;};
            return 98;
          };

          let callCount = 0;
          tweenable.stop = () => {
            callCount += 1;
          };

          tweenable.seek(98);
          assert.equal(callCount, 0, 'stop should not have been called');
        });
      });

      describe('#stop', () => {
        it('stop(undefined) leaves a tween where it was stopped', () => {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          tweenable.stop();
          assert.equal(tweenable.get().x, 50,
            'The tweened value did not go to the end, it was left at its last updated position');
          assert.equal(tweenable._isTweening, false,
            'The internal state of the Tweenable indicates it is not running (updating)');
        });

        it('stop(true) skips a tween to the end', () => {
          const tweenable = new Tweenable();
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          tweenable.stop(true);
          assert.equal(tweenable.get().x, 100,
            'The tweened value jumps to the end');
        });
      });

      describe('#setScheduleFunction', () => {
        it('calling setScheduleFunction change the internal schedule function', () => {
          const mockScheduleFunctionCalls = [];
          function mockScheduleFunction(fn, delay) {
            mockScheduleFunctionCalls.push({fn, delay});
          }

          tweenable.setScheduleFunction(mockScheduleFunction);
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          tweenable._timeoutHandler();
          tweenable.stop(true);

          assert(mockScheduleFunctionCalls.length,
            'The custom schedule function has been called');
          assert.equal(typeof mockScheduleFunctionCalls[0].fn, 'function',
            'The first given parameter to the custom schedule function was a function');
          assert.equal(typeof mockScheduleFunctionCalls[0].delay, 'number',
            'The second given parameter to the custom schedule function was a number');
        });
      });

      describe('lifecycle hooks', () => {
        let testState;

        describe('step', () => {
          it('receives the current state', () => {
            Tweenable.now = _ => 0;
            tweenable = new Tweenable();

            tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10  },
                duration: 500,
                step: currentState => testState = currentState
              });

            Tweenable.now = _ => 250;
            tweenable._timeoutHandler();

            assert.deepEqual(testState, { x: 5 });
          });
        });

        describe('start', () => {
          it('receives the current state', () => {
            Tweenable.now = _ => 0;
            tweenable = new Tweenable();

            tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10  },
                duration: 500,
                start: currentState => testState = currentState
              });

            Tweenable.now = _ => 500;
            tweenable._timeoutHandler();

            assert.deepEqual(testState, { x: 0 });
          });
        });
      });

      describe('promise support', () => {
        it('supports third party libraries', function () {
          const promised = tweenable.tween({
            promise: Promised,

            from: { x: 0 },
            to: { x: 10  },
            duration: 500
          });

          assert.ok(promised instanceof Promised);
        });

        describe('resolution', () => {
          let testState;

          before(() => {
            Tweenable.now = _ => 0;
            tweenable = new Tweenable();

            let tween = tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10  },
                duration: 500,
              })
              .then(currentState => testState = currentState);

            Tweenable.now = _ => 500;
            tweenable._timeoutHandler();

            return tween;
          });

          it('resolves with final state', () => {
            assert.deepEqual(testState, { x: 10 });
          });
        });

        describe('rejection', () => {
          let testState;

          before(() => {
            Tweenable.now = _ => 0;
            tweenable = new Tweenable();

            let tween = tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10  },
                duration: 500,
              })
              .catch(currentState => testState = currentState);

            Tweenable.now = _ => 250;
            tweenable._timeoutHandler();
            tweenable.stop();

            return tween;
          });

          it('rejects with most recent state', () => {
            assert.deepEqual(testState, { x: 5 });
          });
        });
      });
    });

    describe('delay support', () => {
      it('tween does not start until delay is met', () => {
        Tweenable.now = _ => 0;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 10 },
          delay: 500,
          duration: 1000
        });

        assert.equal(tweenable.get().x, 0,
          'The tween starts at the initial value');

        Tweenable.now = _ => 250;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 0,
          'The tween is interpolated for position 0 until the delay has been met');

        Tweenable.now = _ => 1000;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 5,
          'The delay offset is accounted for during the tween');

        Tweenable.now = _ => 1500;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 10,
          'The tween ends at position 1 with the delay');

        Tweenable.now = _ => 99999;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 10,
          'The tween ends does not go past position 1 after completing');
      });

      it('pause() functionality is not affected by delay', () => {
        const delay = 5000;
        Tweenable.now = _ => 0;

        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          delay: delay,
          duration: 1000
        });

        Tweenable.now = _ => 500 + delay;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 50,
          'Pre-pause: The middle of the tween equates to .5 of the target value');

        tweenable.pause();
        Tweenable.now = _ => 2000 + delay;
        tweenable.resume();
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 50,
          'The tween has not changed in the time that it has been paused');

        Tweenable.now = _ => 2500 + delay;
        tweenable._timeoutHandler();
        assert.equal(tweenable.get().x, 100,
          'The tween ends at the modified end time');
      });
    });

    describe('interpolate', () => {
      it('computes the midpoint of two numbers', () => {
        const interpolated = interpolate({ x: 0 }, { x: 10 }, 0.5);

        assert.equal(5, interpolated.x, 'Midpoint was computed');
      });

      it('computes the midpoint of two token strings', () => {
        const interpolated = interpolate({ color: '#000' }, { color: '#fff' }, 0.5);

        assert.equal('rgb(127,127,127)', interpolated.color,
          'Midpoint color was computed');
      });

      it('accounts for optional delay', () => {
        let interpolated = interpolate(
          { x: 0 }, { x: 10 }, 0.5, 'linear', 0.5);
        assert.equal(interpolated.x, 0, 'Beginning of delayed tween was computed');

        interpolated = interpolate(
          { x: 0 }, { x: 10 }, 1.0, 'linear', 0.5);
        assert.equal(interpolated.x, 5, 'Midpoint delayed tween was computed');

        interpolated = interpolate(
          { x: 0 }, { x: 10 }, 1.5, 'linear', 0.5);
        assert.equal(interpolated.x, 10, 'End of delayed tween was computed');
      });

      it('supports per-interpolation custom easing curves', () => {
        const easingFn = pos => pos * 2;

        const interpolated = interpolate(
          { x: 0 }, { x: 10 }, 0.5, easingFn);
        assert.equal(interpolated.x, 10,
          'Accepts and applies non-Tweenable.formula easing function');
      });

      describe('token support', () => {
        it('can tween an rgb color', () => {
          const from = { color: 'rgb(0,128,255)' },
              to = { color: 'rgb(128,255,0)' };

          let interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, from.color,
            'The initial interpolated value is the same as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(64,191,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, to.color,
            'The final interpolated value is the same as the target color');
        });

        it('can tween an rgb color with a number in the tween', () => {
          const from = { color: 'rgb(0,128,255)', x: 0 },
              to =  { color: 'rgb(128,255,0)', x: 10 };

          let interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, from.color,
            'The initial interpolated value is the same as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(64,191,127)',
            'The interpolated color value at 50% is a 50/50 mixture of the start and end colors');
          assert.equal(interpolated.x, 5,
            'The interpolated x value at 50% is the midpoint of the start and end x values');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, to.color,
            'The final interpolated value is the same as the target color');
        });

        it('can tween hex color values', () => {
          const from = { color: '#ff00ff' },
              to =  { color: '#00ff00' };

          let interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, 'rgb(255,0,255)',
            'The initial interpolated value is the rgb equivalent as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(127,127,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, 'rgb(0,255,0)',
            'The final interpolated value is the rgb equivalent as the target color');
        });


        it('can tween multiple rgb color tokens', () => {
          const from = { color: 'rgb(0,128,255) rgb(255,0,255)' },
              to =  { color: 'rgb(128,255,0) rgb(0,255,0)' };

          let interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, from.color,
            'The initial interpolated value is the same as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(64,191,127) rgb(127,127,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, to.color,
            'The final interpolated value is the same as the target color');
        });

        it('each token chunk can have it\'s own easing curve', () => {
          const from = { color: 'rgb(0,0,0)' },
              to =  { color: 'rgb(255,255,255)' },
              easing = 'linear easeInQuad easeInCubic';

          const interpolated = interpolate(from, to, 0.5, easing);
          const interpolatedR = parseInt(interpolate(
            {r:0}, {r:255}, 0.5, 'linear').r, 10);
          const interpolatedG = parseInt(interpolate(
            {g:0}, {g:255}, 0.5, 'easeInQuad').g, 10);
          const interpolatedB = parseInt(interpolate(
            {b:0}, {b:255}, 0.5, 'easeInCubic').b, 10);
          const targetString = 'rgb(' + interpolatedR + ',' + interpolatedG + ','
            + interpolatedB + ')';

          assert.equal(interpolated.color, targetString,
            'The computed tween value respects the easing strings supplied and their cardinality');
        });

        it('missing token eases inherit from the last easing listed', () => {
          const from = { color: 'rgb(0,0,0)' },
              to =  { color: 'rgb(255,255,255)' },
              easing = 'linear easeInQuad';

          const interpolated = interpolate(from, to, 0.5, easing);
          const interpolatedR = parseInt(interpolate(
            {r:0}, {r:255}, 0.5, 'linear').r, 10);
          const interpolatedG = parseInt(interpolate(
            {g:0}, {g:255}, 0.5, 'easeInQuad').g, 10);
          const interpolatedB = parseInt(interpolate(
            {b:0}, {b:255}, 0.5, 'easeInQuad').b, 10);
          const targetString = 'rgb(' + interpolatedR + ',' + interpolatedG + ','
            + interpolatedB + ')';

          assert.equal(interpolated.color, targetString,
            'The computed tween value inherits the last tween listed if there is a cardinality mismatch');
        });

        it('can tween a negative value token to a positive value', () => {
          const from = { transform: 'translateX(-50)' },
              to =  { transform: 'translateX(50)' },
              easing = 'linear';

          let interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.transform, 'translateX(-50)',
            'The initial interpolated value is the same as the initial transform');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.transform, 'translateX(0)',
            'The interpolated value at 50% is at the midpoint of the start and end translations');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.transform, 'translateX(50)',
            'The final interpolated value is the same as the target transform');
        });

        it('can interpolate two number strings that have no non-number token structure',
          () => {
          const from = { x: '2' };
          const to = { x: '3' };
          const interpolated = interpolate(from, to, 0.5);

          assert.equal(interpolated.x, '2.5',
            'Token-less strings were successfully interpolated');
        });

        it('can tween css value pairs', () => {
          const from = { x: '0px 0px' };
          const to = { x: '100px 100px' };

          const interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.x, '50px 50px', 'The string was interpolated correctly');
        });
      });

      describe('bezier support', () => {
        it('can create a linear bezier easing curve', () => {
          setBezierFunction('bezier-linear', 0.250, 0.250, 0.750, 0.750);

          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.25, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.25, 'bezier-linear').x.toFixed(1),
            'linear and dynamic bezier-linear are reasonably equivalent at 0.25');
          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.5, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.5, 'bezier-linear').x.toFixed(1),
            'linear and dynamic bezier-linear are reasonably equivalent at 0.5');
          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.75, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.75, 'bezier-linear').x.toFixed(1),
            'linear and dynamic bezier-linear are reasonably equivalent at 0.75');
        });

        it('can create a "stretched" linear bezier easing curve', () => {
          setBezierFunction('bezier-stretched-linear', 0, 0, 1, 1);

          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.25, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.25, 'bezier-stretched-linear').x.toFixed(1),
            'linear and dynamic bezier-stretched-linear are reasonably equivalent at 0.25');
          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.5, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.5, 'bezier-stretched-linear').x.toFixed(1),
            'linear and dynamic bezier-stretched-linear are reasonably equivalent at 0.5');
          assert.equal(
            interpolate({x: 0}, {x: 10}, 0.75, 'linear').x.toFixed(1),
            interpolate({x: 0}, {x: 10}, 0.75, 'bezier-stretched-linear').x.toFixed(1),
            'linear and dynamic bezier-stretched-linear are reasonably equivalent at 0.75');
        });

        it('can remove a bezier easing curve', () => {
          setBezierFunction('bezier-linear', 0, 0, 1, 1);
          unsetBezierFunction('bezier-linear');
          assert(!Tweenable.prototype['bezier-linear'],
            '"bezier-linear" was deleted');
        });

        it('bezier handle positions are stored on a custom easing function',
          () => {

          const easingFunction =
            setBezierFunction('decoration-test', 0.2, 0.4, 0.6, 0.8);

          assert.equal(easingFunction.displayName, 'decoration-test',
            'Easing function was decorated with name');
          assert.equal(easingFunction.x1, 0.2, 'Easing function was decorated with x1');
          assert.equal(easingFunction.y1, 0.4, 'Easing function was decorated with y1');
          assert.equal(easingFunction.x2, 0.6, 'Easing function was decorated with x2');
          assert.equal(easingFunction.y2, 0.8, 'Easing function was decorated with y2');
        });
      });
    });
  });

  describe('tween', () => {
    it('exists', () => {
      assert(tween);
    });

    it('midpoints of a tween are correctly computed', () => {
      Tweenable.now = _ => 0;
      const promise = tween({
        from: { x: 0 },
        to: { x: 100 },
        duration: 1000
      });

      tweenable = promise.tweenable;

      assert.equal(tweenable.get().x, 0, 'The tween starts at 0');
      Tweenable.now = _ => 500;
      tweenable._timeoutHandler();
      assert.equal(tweenable.get().x, 50,
        'The middle of the tween equates to .5 of the target value');
      Tweenable.now = _ => 1000;
      tweenable._timeoutHandler();
      assert.equal(tweenable.get().x, 100,
        'The end of the tween equates to 1.0 of the target value');
      Tweenable.now = _ => 100000;
      tweenable._timeoutHandler();
      assert.equal(tweenable.get().x, 100,
        'Anything after end of the tween equates to 1.0 of the target value');
    });
  });
});
