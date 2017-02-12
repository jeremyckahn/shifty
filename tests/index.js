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

      describe('#stop', () => {
        it('stop(undefined) leaves a tween where it was stopped', function () {
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          tweenable.stop();
          assert.equal(tweenable.get().x, 50,
            'The tweened value did not go to the end, it was left at its last updated position');
          assert.equal(tweenable._isTweening, false,
            'The internal state of the Tweenable indicates it is not running (updating)');
        });

        it('stop(true) skips a tween to the end', function () {
          var tweenable = new Tweenable();
          Tweenable.now = _ => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000
          });

          Tweenable.now = _ => 500;
          forceInternalUpdate();
          tweenable.stop(true);
          assert.equal(tweenable.get().x, 100,
            'The tweened value jumps to the end');
        });
      });

      describe('#setScheduleFunction', () => {
        it('calling setScheduleFunction change the internal schedule function', function () {
          var mockScheduleFunctionCalls = [];
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
          forceInternalUpdate(tweenable);
          tweenable.stop(true);

          assert(mockScheduleFunctionCalls.length,
            'The custom schedule function has been called');
          assert.equal(typeof mockScheduleFunctionCalls[0].fn, 'function',
            'The first given parameter to the custom schedule function was a function');
          assert.equal(typeof mockScheduleFunctionCalls[0].delay, 'number',
            'The second given parameter to the custom schedule function was a number');
        });
      });
    });

    describe('delay support', () => {
      it('tween does not start until delay is met', function () {
        Tweenable.now = _ => 0;
        tweenable.tween({
          from: { x: 0 }
          ,to: { x: 10 }
          ,delay: 500
          ,duration: 1000
        });

        assert.equal(tweenable.get().x, 0,
          'The tween starts at the initial value');

        Tweenable.now = _ => 250;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 0,
          'The tween is interpolated for position 0 until the delay has been met');

        Tweenable.now = _ => 1000;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 5,
          'The delay offset is accounted for during the tween');

        Tweenable.now = _ => 1500;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 10,
          'The tween ends at position 1 with the delay');

        Tweenable.now = _ => 99999;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 10,
          'The tween ends does not go past position 1 after completing');
      });

      it('pause() functionality is not affected by delay', function () {
        var delay = 5000;
        Tweenable.now = _ => 0;

        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          delay: delay,
          duration: 1000
        });

        Tweenable.now = _ => 500 + delay;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 50,
          'Pre-pause: The middle of the tween equates to .5 of the target value');

        tweenable.pause();
        Tweenable.now = _ => 2000 + delay;
        tweenable.resume();
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 50,
          'The tween has not changed in the time that it has been paused');

        Tweenable.now = _ => 2500 + delay;
        forceInternalUpdate(tweenable);
        assert.equal(tweenable.get().x, 100,
          'The tween ends at the modified end time');
      });
    });

    describe('interpolate', () => {
      it('computes the midpoint of two numbers', function () {
        var interpolated = interpolate({ x: 0 }, { x: 10 }, 0.5);

        assert.equal(5, interpolated.x, 'Midpoint was computed');
      });

      it('computes the midpoint of two token strings', function () {
        var interpolated = interpolate({ color: '#000' }, { color: '#fff' }, 0.5);

        assert.equal('rgb(127,127,127)', interpolated.color,
          'Midpoint color was computed');
      });

      it('accounts for optional delay', function () {
        var interpolated = interpolate(
          { x: 0 }, { x: 10 }, 0.5, 'linear', 0.5);
        assert.equal(interpolated.x, 0, 'Beginning of delayed tween was computed');

        interpolated = interpolate(
          { x: 0 }, { x: 10 }, 1.0, 'linear', 0.5);
        assert.equal(interpolated.x, 5, 'Midpoint delayed tween was computed');

        interpolated = interpolate(
          { x: 0 }, { x: 10 }, 1.5, 'linear', 0.5);
        assert.equal(interpolated.x, 10, 'End of delayed tween was computed');
      });

      it('supports per-interpolation custom easing curves', function () {
        var easingFn = pos => pos * 2;

        var interpolated = interpolate(
          { x: 0 }, { x: 10 }, 0.5, easingFn);
        assert.equal(interpolated.x, 10,
          'Accepts and applies non-Tweenable#formula easing function');
      });

      describe('token support', () => {
        it('can tween an rgb color', function () {
          var from = { color: 'rgb(0,128,255)' }
              ,to = { color: 'rgb(128,255,0)' };

          var interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, from.color,
            'The initial interpolated value is the same as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(64,191,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, to.color,
            'The final interpolated value is the same as the target color');
        });

        it('can tween an rgb color with a number in the tween', function () {
          var from = { color: 'rgb(0,128,255)', x: 0 }
              ,to =  { color: 'rgb(128,255,0)', x: 10 };

          var interpolated = interpolate(from, to, 0);
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

        it('can tween hex color values', function () {
          var from = { color: '#ff00ff' }
              ,to =  { color: '#00ff00' };

          var interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, 'rgb(255,0,255)',
            'The initial interpolated value is the rgb equivalent as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(127,127,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, 'rgb(0,255,0)',
            'The final interpolated value is the rgb equivalent as the target color');
        });


        it('can tween multiple rgb color tokens', function () {
          var from = { color: 'rgb(0,128,255) rgb(255,0,255)' }
              ,to =  { color: 'rgb(128,255,0) rgb(0,255,0)' };

          var interpolated = interpolate(from, to, 0);
          assert.equal(interpolated.color, from.color,
            'The initial interpolated value is the same as the initial color');
          interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.color, 'rgb(64,191,127) rgb(127,127,127)',
            'The interpolated value at 50% is a 50/50 mixture of the start and end colors');
          interpolated = interpolate(from, to, 1);
          assert.equal(interpolated.color, to.color,
            'The final interpolated value is the same as the target color');
        });

        it('each token chunk can have it\'s own easing curve', function () {
          var from = { color: 'rgb(0,0,0)' }
              ,to =  { color: 'rgb(255,255,255)' }
              ,easing = 'linear easeInQuad easeInCubic';

          var interpolated = interpolate(from, to, 0.5, easing);
          var interpolatedR = parseInt(interpolate(
            {r:0}, {r:255}, 0.5, 'linear').r, 10);
          var interpolatedG = parseInt(interpolate(
            {g:0}, {g:255}, 0.5, 'easeInQuad').g, 10);
          var interpolatedB = parseInt(interpolate(
            {b:0}, {b:255}, 0.5, 'easeInCubic').b, 10);
          var targetString = 'rgb(' + interpolatedR + ',' + interpolatedG + ','
            + interpolatedB + ')';

          assert.equal(interpolated.color, targetString,
            'The computed tween value respects the easing strings supplied and their cardinality');
        });

        it('missing token eases inherit from the last easing listed', function () {
          var from = { color: 'rgb(0,0,0)' }
              ,to =  { color: 'rgb(255,255,255)' }
              ,easing = 'linear easeInQuad';

          var interpolated = interpolate(from, to, 0.5, easing);
          var interpolatedR = parseInt(interpolate(
            {r:0}, {r:255}, 0.5, 'linear').r, 10);
          var interpolatedG = parseInt(interpolate(
            {g:0}, {g:255}, 0.5, 'easeInQuad').g, 10);
          var interpolatedB = parseInt(interpolate(
            {b:0}, {b:255}, 0.5, 'easeInQuad').b, 10);
          var targetString = 'rgb(' + interpolatedR + ',' + interpolatedG + ','
            + interpolatedB + ')';

          assert.equal(interpolated.color, targetString,
            'The computed tween value inherits the last tween listed if there is a cardinality mismatch');
        });

        it('can tween a negative value token to a positive value', function () {
          var from = { transform: 'translateX(-50)' }
              ,to =  { transform: 'translateX(50)' }
              ,easing = 'linear';

          var interpolated = interpolate(from, to, 0);
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
          function () {
          var from = { x: '2' };
          var to = { x: '3' };
          var interpolated = interpolate(from, to, 0.5);

          assert.equal(interpolated.x, '2.5',
            'Token-less strings were successfully interpolated');
        });

        it('can tween css value pairs', function () {
          var from = { x: '0px 0px' };
          var to = { x: '100px 100px' };

          var interpolated = interpolate(from, to, 0.5);
          assert.equal(interpolated.x, '50px 50px', 'The string was interpolated correctly');
        });
      });

      describe('bezier support', () => {
        it('can create a linear bezier easing curve', function () {
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

        it('can create a "stretched" linear bezier easing curve', function () {
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

        it('can remove a bezier easing curve', function () {
          setBezierFunction('bezier-linear', 0, 0, 1, 1);
          unsetBezierFunction('bezier-linear');
          assert(!Tweenable.prototype['bezier-linear'],
            '"bezier-linear" was deleted');
        });

        it('bezier handle positions are stored on a custom easing function',
          function () {

          var easingFunction =
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
});
