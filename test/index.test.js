import Promised from 'bluebird';

import {
  Tweenable,
  interpolate,
  setBezierFunction,
  tween,
  unsetBezierFunction,
} from '../src';

import { processTweens, scheduleUpdate } from '../src/tweenable';

import * as shifty from '../src';

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
      if (tweenable.isPlaying()) {
        tweenable.stop();
      }

      tweenable = undefined;
      state = undefined;
      Tweenable.now = now;
    });

    test('can accept initial state', () => {
      tweenable = new Tweenable({ x: 5 });

      Tweenable.now = () => 0;
      tweenable.tween({
        to: { x: 10 },
        duration: 1000,
        step: function(_state) {
          state = _state;
        },
      });

      Tweenable.now = () => 500;
      processTweens();
      expect(state.x).toEqual(7.5);
    });

    describe('#tween', () => {
      test('midpoints of a tween are correctly computed', () => {
        Tweenable.now = () => 0;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          duration: 1000,
        });

        expect(tweenable.get().x).toEqual(0);
        Tweenable.now = () => 500;
        processTweens();
        expect(tweenable.get().x).toEqual(50);
        Tweenable.now = () => 1000;
        processTweens();
        expect(tweenable.get().x).toEqual(100);
        Tweenable.now = () => 100000;
        processTweens();
        expect(tweenable.get().x).toEqual(100);
      });

      test('step handler receives timestamp offset', () => {
        Tweenable.now = () => 0;
        let capturedOffset;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          duration: 1000,
          step: function(state, attachment, offset) {
            capturedOffset = offset;
          },
        });

        Tweenable.now = () => 500;
        processTweens();
        expect(capturedOffset).toEqual(500);
      });

      describe('custom easing functions', () => {
        let easingFn = pos => pos * 2;

        test('can be given an easing function directly', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 10 },
            duration: 1000,
            easing: easingFn,
          });

          expect(tweenable.get().x).toEqual(0);

          Tweenable.now = () => 500;
          processTweens();
          expect(tweenable.get().x).toEqual(10);

          Tweenable.now = () => 1000;
          processTweens();
          expect(tweenable.get().x).toEqual(20);
        });

        test('can be given an Object of easing functions directly', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 10 },
            duration: 1000,
            easing: { x: easingFn },
          });

          expect(tweenable.get().x).toEqual(0);

          Tweenable.now = () => 500;
          processTweens();
          expect(tweenable.get().x).toEqual(10);

          Tweenable.now = () => 1000;
          processTweens();
          expect(tweenable.get().x).toEqual(20);
        });

        test('supports tokens', () => {
          Tweenable.now = () => 0;
          easingFn = pos => pos;
          tweenable.tween({
            from: { x: 'rgb(0,0,0)' },
            to: { x: 'rgb(255,255,255)' },
            duration: 1000,
            easing: { x: easingFn },
          });

          expect(tweenable.get().x).toEqual('rgb(0,0,0)');

          Tweenable.now = () => 500;
          processTweens();
          expect(tweenable.get().x).toEqual('rgb(127,127,127)');

          Tweenable.now = () => 1000;
          processTweens();
          expect(tweenable.get().x).toEqual('rgb(255,255,255)');
        });
      });

      describe('#pause', () => {
        test('moves the end time of the tween', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          Tweenable.now = () => 500;
          processTweens();
          expect(tweenable.get().x).toEqual(50);
          tweenable.pause();

          Tweenable.now = () => 2000;
          tweenable.resume();
          processTweens();
          expect(tweenable.get().x).toEqual(50);

          Tweenable.now = () => 2500;
          processTweens();
          expect(tweenable.get().x).toEqual(100);
        });
      });

      describe('#seek', () => {
        test('forces the tween to a specific point on the timeline', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          tweenable.seek(500);
          expect(tweenable._timestamp).toEqual(-500);
        });

        test('provides correct value to step handler via seek() (issue #77)', () => {
          let computedX;
          tweenable = new Tweenable(null, {
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
            step: function(state) {
              computedX = state.x;
            },
          });

          tweenable.seek(500);
          expect(computedX).toEqual(50);
        });

        test('The seek() parameter cannot be less than 0', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          tweenable.seek(-500);
          expect(tweenable._timestamp).toEqual(0);
        });

        test('no-ops if seeking to the current millisecond', () => {
          let stepHandlerCallCount = 0;
          Tweenable.now = () => 0;

          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
            step: () => {
              stepHandlerCallCount++;
            },
          });

          tweenable.seek(50);
          tweenable.stop();
          tweenable.seek(50);
          expect(stepHandlerCallCount).toEqual(1);
        });

        test('keeps time reference (rel #60)', () => {
          tweenable = new Tweenable(
            {},
            {
              from: { x: 0 },
              to: { x: 100 },
              duration: 100,
            }
          );

          // express a delay in time between the both time it's called
          // TODO: This could probably be written in a much clearer way.
          Tweenable.now = () => {
            Tweenable.now = () => {
              return 100;
            };
            return 98;
          };

          let callCount = 0;
          tweenable.stop = () => {
            callCount += 1;
          };

          tweenable.seek(98);
          expect(callCount).toEqual(0);
        });
      });

      describe('#stop', () => {
        test('stop(undefined) leaves a tween where it was stopped', () => {
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          Tweenable.now = () => 500;
          processTweens();
          tweenable.stop();
          expect(tweenable.get().x).toEqual(50);
          expect(tweenable._isTweening).toEqual(false);
        });

        test('stop(true) skips a tween to the end', () => {
          const tweenable = new Tweenable();
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          Tweenable.now = () => 500;
          processTweens();
          tweenable.stop(true);
          expect(tweenable.get().x).toEqual(100);
        });

        describe('repeated calls (#105)', () => {
          describe('first tween is stopped twice', () => {
            beforeEach(() => {
              Tweenable.now = () => 0;

              let { tweenable } = tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              });

              tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              });

              Tweenable.now = () => 250;
              processTweens();

              tweenable.stop(true);
              tweenable.stop(true);
            });

            test('does not break when multiple tweens are running and stop() is called twice', () => {
              expect(true).toBeTruthy();
            });
          });

          describe('second tween is stopped twice', () => {
            beforeEach(() => {
              Tweenable.now = () => 0;

              tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              });

              let { tweenable } = tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              });

              Tweenable.now = () => 250;
              processTweens();

              tweenable.stop(true);
              tweenable.stop(true);
            });

            test('does not break when multiple tweens are running and stop() is called twice', () => {
              expect(true).toBeTruthy();
            });
          });
        });
      });

      describe('#setScheduleFunction', () => {
        test('calling setScheduleFunction change the internal schedule function', () => {
          const mockScheduleFunctionCalls = [];
          function mockScheduleFunction(fn, delay) {
            mockScheduleFunctionCalls.push({ fn, delay });
          }

          tweenable.setScheduleFunction(mockScheduleFunction);
          Tweenable.now = () => 0;
          tweenable.tween({
            from: { x: 0 },
            to: { x: 100 },
            duration: 1000,
          });

          Tweenable.now = () => 500;
          scheduleUpdate();
          tweenable.stop(true);

          expect(mockScheduleFunctionCalls.length).toBeTruthy();
          expect(typeof mockScheduleFunctionCalls[0].fn).toEqual('function');
          expect(typeof mockScheduleFunctionCalls[0].delay).toEqual('number');
        });
      });

      describe('lifecycle hooks', () => {
        let testState;

        describe('step', () => {
          test('receives the current state', () => {
            Tweenable.now = () => 0;
            tweenable = new Tweenable();

            tweenable.tween({
              from: { x: 0 },
              to: { x: 10 },
              duration: 500,
              step: currentState => (testState = currentState),
            });

            Tweenable.now = () => 250;
            processTweens();

            expect(testState).toEqual({ x: 5 });
          });
        });

        describe('start', () => {
          test('receives the current state', () => {
            Tweenable.now = () => 0;
            tweenable = new Tweenable();

            tweenable.tween({
              from: { x: 0 },
              to: { x: 10 },
              duration: 500,
              start: currentState => (testState = currentState),
            });

            Tweenable.now = () => 500;
            processTweens();

            expect(testState).toEqual({ x: 0 });
          });
        });
      });

      describe('promise support', () => {
        test('supports third party libraries', () => {
          const promised = tweenable.tween({
            promise: Promised,

            from: { x: 0 },
            to: { x: 10 },
            duration: 500,
          });

          expect(promised instanceof Promised).toBeTruthy();
        });

        describe('resolution', () => {
          let testState;

          beforeAll(() => {
            Tweenable.now = () => 0;
            tweenable = new Tweenable();

            let tween = tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              })
              .then(currentState => (testState = currentState));

            Tweenable.now = () => 500;
            processTweens();

            return tween;
          });

          test('resolves with final state', () => {
            expect(testState).toEqual({ x: 10 });
          });
        });

        describe('rejection', () => {
          let testState;

          beforeAll(() => {
            Tweenable.now = () => 0;
            tweenable = new Tweenable();

            let tween = tweenable
              .tween({
                from: { x: 0 },
                to: { x: 10 },
                duration: 500,
              })
              .catch(currentState => (testState = currentState));

            Tweenable.now = () => 250;
            processTweens();
            tweenable.stop();

            return tween;
          });

          test('rejects with most recent state', () => {
            expect(testState).toEqual({ x: 5 });
          });
        });
      });
    });

    describe('delay support', () => {
      test('tween does not start until delay is met', () => {
        Tweenable.now = () => 0;
        tweenable.tween({
          from: { x: 0 },
          to: { x: 10 },
          delay: 500,
          duration: 1000,
        });

        expect(tweenable.get().x).toEqual(0);

        Tweenable.now = () => 250;
        processTweens();
        expect(tweenable.get().x).toEqual(0);

        Tweenable.now = () => 1000;
        processTweens();
        expect(tweenable.get().x).toEqual(5);

        Tweenable.now = () => 1500;
        processTweens();
        expect(tweenable.get().x).toEqual(10);

        Tweenable.now = () => 99999;
        processTweens();
        expect(tweenable.get().x).toEqual(10);
      });

      test('pause() functionality is not affected by delay', () => {
        const delay = 5000;
        Tweenable.now = () => 0;

        tweenable.tween({
          from: { x: 0 },
          to: { x: 100 },
          delay: delay,
          duration: 1000,
        });

        Tweenable.now = () => 500 + delay;
        processTweens();
        expect(tweenable.get().x).toEqual(50);

        tweenable.pause();
        Tweenable.now = () => 2000 + delay;
        tweenable.resume();
        processTweens();
        expect(tweenable.get().x).toEqual(50);

        Tweenable.now = () => 2500 + delay;
        processTweens();
        expect(tweenable.get().x).toEqual(100);
      });
    });

    describe('interpolate', () => {
      test('computes the midpoint of two numbers', () => {
        const interpolated = interpolate({ x: 0 }, { x: 10 }, 0.5);

        expect(5).toEqual(interpolated.x);
      });

      test('computes the midpoint of two token strings', () => {
        const interpolated = interpolate(
          { color: '#000' },
          { color: '#fff' },
          0.5
        );

        expect('rgb(127,127,127)').toEqual(interpolated.color);
      });

      test('accounts for optional delay', () => {
        let interpolated = interpolate({ x: 0 }, { x: 10 }, 0.5, 'linear', 0.5);
        expect(interpolated.x).toEqual(0);

        interpolated = interpolate({ x: 0 }, { x: 10 }, 1.0, 'linear', 0.5);
        expect(interpolated.x).toEqual(5);

        interpolated = interpolate({ x: 0 }, { x: 10 }, 1.5, 'linear', 0.5);
        expect(interpolated.x).toEqual(10);
      });

      test('supports per-interpolation custom easing curves', () => {
        const easingFn = pos => pos * 2;

        const interpolated = interpolate({ x: 0 }, { x: 10 }, 0.5, easingFn);
        expect(interpolated.x).toEqual(10);
      });

      describe('token support', () => {
        test('can tween an rgb color', () => {
          const from = { color: 'rgb(0,128,255)' },
            to = { color: 'rgb(128,255,0)' };

          let interpolated = interpolate(from, to, 0);
          expect(interpolated.color).toEqual(from.color);
          interpolated = interpolate(from, to, 0.5);
          expect(interpolated.color).toEqual('rgb(64,191,127)');
          interpolated = interpolate(from, to, 1);
          expect(interpolated.color).toEqual(to.color);
        });

        test('can tween an rgb color with a number in the tween', () => {
          const from = { color: 'rgb(0,128,255)', x: 0 },
            to = { color: 'rgb(128,255,0)', x: 10 };

          let interpolated = interpolate(from, to, 0);
          expect(interpolated.color).toEqual(from.color);
          interpolated = interpolate(from, to, 0.5);
          expect(interpolated.color).toEqual('rgb(64,191,127)');
          expect(interpolated.x).toEqual(5);
          interpolated = interpolate(from, to, 1);
          expect(interpolated.color).toEqual(to.color);
        });

        test('can tween hex color values', () => {
          const from = { color: '#ff00ff' },
            to = { color: '#00ff00' };

          let interpolated = interpolate(from, to, 0);
          expect(interpolated.color).toEqual('rgb(255,0,255)');
          interpolated = interpolate(from, to, 0.5);
          expect(interpolated.color).toEqual('rgb(127,127,127)');
          interpolated = interpolate(from, to, 1);
          expect(interpolated.color).toEqual('rgb(0,255,0)');
        });

        test('can tween multiple rgb color tokens', () => {
          const from = { color: 'rgb(0,128,255) rgb(255,0,255)' },
            to = { color: 'rgb(128,255,0) rgb(0,255,0)' };

          let interpolated = interpolate(from, to, 0);
          expect(interpolated.color).toEqual(from.color);
          interpolated = interpolate(from, to, 0.5);
          expect(interpolated.color).toEqual(
            'rgb(64,191,127) rgb(127,127,127)'
          );
          interpolated = interpolate(from, to, 1);
          expect(interpolated.color).toEqual(to.color);
        });

        test("each token chunk can have it's own easing curve", () => {
          const from = { color: 'rgb(0,0,0)' },
            to = { color: 'rgb(255,255,255)' },
            easing = 'linear easeInQuad easeInCubic';

          const interpolated = interpolate(from, to, 0.5, easing);
          const interpolatedR = parseInt(
            interpolate({ r: 0 }, { r: 255 }, 0.5, 'linear').r,
            10
          );
          const interpolatedG = parseInt(
            interpolate({ g: 0 }, { g: 255 }, 0.5, 'easeInQuad').g,
            10
          );
          const interpolatedB = parseInt(
            interpolate({ b: 0 }, { b: 255 }, 0.5, 'easeInCubic').b,
            10
          );
          const targetString =
            'rgb(' +
            interpolatedR +
            ',' +
            interpolatedG +
            ',' +
            interpolatedB +
            ')';

          expect(interpolated.color).toEqual(targetString);
        });

        test('missing token eases inherit from the last easing listed', () => {
          const from = { color: 'rgb(0,0,0)' },
            to = { color: 'rgb(255,255,255)' },
            easing = 'linear easeInQuad';

          const interpolated = interpolate(from, to, 0.5, easing);
          const interpolatedR = parseInt(
            interpolate({ r: 0 }, { r: 255 }, 0.5, 'linear').r,
            10
          );
          const interpolatedG = parseInt(
            interpolate({ g: 0 }, { g: 255 }, 0.5, 'easeInQuad').g,
            10
          );
          const interpolatedB = parseInt(
            interpolate({ b: 0 }, { b: 255 }, 0.5, 'easeInQuad').b,
            10
          );
          const targetString =
            'rgb(' +
            interpolatedR +
            ',' +
            interpolatedG +
            ',' +
            interpolatedB +
            ')';

          expect(interpolated.color).toEqual(targetString);
        });

        test('can tween a negative value token to a positive value', () => {
          const from = { transform: 'translateX(-50)' },
            to = { transform: 'translateX(50)' };

          let interpolated = interpolate(from, to, 0);
          expect(interpolated.transform).toEqual('translateX(-50)');
          interpolated = interpolate(from, to, 0.5);
          expect(interpolated.transform).toEqual('translateX(0)');
          interpolated = interpolate(from, to, 1);
          expect(interpolated.transform).toEqual('translateX(50)');
        });

        test('can interpolate two number strings that have no non-number token structure', () => {
          const from = { x: '2' };
          const to = { x: '3' };
          const interpolated = interpolate(from, to, 0.5);

          expect(interpolated.x).toEqual('2.5');
        });

        test('can tween css value pairs', () => {
          const from = { x: '0px 0px' };
          const to = { x: '100px 100px' };

          const interpolated = interpolate(from, to, 0.5);
          expect(interpolated.x).toEqual('50px 50px');
        });
      });

      describe('bezier support', () => {
        test('can create a linear bezier easing curve', () => {
          setBezierFunction('bezier-linear', 0.25, 0.25, 0.75, 0.75);

          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.25, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate({ x: 0 }, { x: 10 }, 0.25, 'bezier-linear').x.toFixed(1)
          );
          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.5, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate({ x: 0 }, { x: 10 }, 0.5, 'bezier-linear').x.toFixed(1)
          );
          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.75, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate({ x: 0 }, { x: 10 }, 0.75, 'bezier-linear').x.toFixed(1)
          );
        });

        test('can create a "stretched" linear bezier easing curve', () => {
          setBezierFunction('bezier-stretched-linear', 0, 0, 1, 1);

          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.25, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate(
              { x: 0 },
              { x: 10 },
              0.25,
              'bezier-stretched-linear'
            ).x.toFixed(1)
          );
          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.5, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate(
              { x: 0 },
              { x: 10 },
              0.5,
              'bezier-stretched-linear'
            ).x.toFixed(1)
          );
          expect(
            interpolate({ x: 0 }, { x: 10 }, 0.75, 'linear').x.toFixed(1)
          ).toEqual(
            interpolate(
              { x: 0 },
              { x: 10 },
              0.75,
              'bezier-stretched-linear'
            ).x.toFixed(1)
          );
        });

        test('can remove a bezier easing curve', () => {
          setBezierFunction('bezier-linear', 0, 0, 1, 1);
          unsetBezierFunction('bezier-linear');
          expect(!Tweenable.prototype['bezier-linear']).toBeTruthy();
        });

        test('bezier handle positions are stored on a custom easing function', () => {
          const easingFunction = setBezierFunction(
            'decoration-test',
            0.2,
            0.4,
            0.6,
            0.8
          );

          expect(easingFunction.displayName).toEqual('decoration-test');
          expect(easingFunction.x1).toEqual(0.2);
          expect(easingFunction.y1).toEqual(0.4);
          expect(easingFunction.x2).toEqual(0.6);
          expect(easingFunction.y2).toEqual(0.8);
        });
      });
    });
  });

  describe('tween', () => {
    test('exists', () => {
      expect(tween).toBeTruthy();
    });

    test('midpoints of a tween are correctly computed', () => {
      Tweenable.now = () => 0;
      const promise = tween({
        from: { x: 0 },
        to: { x: 100 },
        duration: 1000,
      });

      tweenable = promise.tweenable;

      expect(tweenable.get().x).toEqual(0);
      Tweenable.now = () => 500;
      processTweens();
      expect(tweenable.get().x).toEqual(50);
      Tweenable.now = () => 1000;
      processTweens();
      expect(tweenable.get().x).toEqual(100);
      Tweenable.now = () => 100000;
      processTweens();
      expect(tweenable.get().x).toEqual(100);
    });
  });
});
