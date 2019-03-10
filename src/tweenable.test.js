import Promised from 'bluebird';
import { Tweenable, tween } from '../src';
import {
  getListHead,
  getListTail,
  processTweens,
  resetList,
  scheduleUpdate,
} from './tweenable';

const now = Tweenable.now;

let tweenable, state;

beforeEach(() => {
  tweenable = new Tweenable();
});

afterEach(() => {
  resetList();

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

  describe('re-tweening previously paused tweens', () => {
    test('uses correct _timestamp', () => {
      Tweenable.now = () => 0;
      tweenable.tween({});
      Tweenable.now = () => 250;
      tweenable.pause();
      expect(tweenable._timestamp).toEqual(0);
      Tweenable.now = () => 500;
      tweenable.tween();
      expect(tweenable._timestamp).toEqual(500);
    });
  });
});

describe('#resume', () => {
  beforeEach(() => {
    Tweenable.now = () => 0;
  });

  test('calls tween if not called previously', () => {
    jest.spyOn(tweenable, 'tween');
    tweenable.resume();
    expect(tweenable.tween).toHaveBeenCalled();
  });

  test('shifts timestamp to account for amount of time paused', () => {
    tweenable.tween();
    expect(tweenable._timestamp).toEqual(0);

    Tweenable.now = () => 500;
    tweenable.pause();
    Tweenable.now = () => 750;
    tweenable.resume();
    expect(tweenable._timestamp).toEqual(250);
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
    expect(tweenable._isPlaying).toEqual(false);
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

describe('static tween', () => {
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

describe('linked tween list', () => {
  let head, middle, tail;

  beforeEach(() => {
    head = new Tweenable();
    middle = new Tweenable();
    tail = new Tweenable();
  });

  describe('single tweenable', () => {
    beforeEach(() => {
      tweenable.tween({});
    });

    describe('adding to the list', () => {
      test('tween becomes both head and tail', () => {
        expect(getListHead()).toBe(tweenable);
        expect(getListTail()).toBe(tweenable);
        expect(tweenable._previous).toBe(null);
        expect(tweenable._next).toBe(null);
      });
    });

    describe('removing from the list', () => {
      describe('pause', () => {
        test('resets head and tail', () => {
          tweenable.pause();
          expect(getListHead()).toBe(null);
          expect(getListTail()).toBe(null);
          expect(tweenable._previous).toBe(null);
          expect(tweenable._next).toBe(null);
        });
      });

      describe('stop', () => {
        test('resets head and tail', () => {
          tweenable.stop();
          expect(getListHead()).toBe(null);
          expect(getListTail()).toBe(null);
          expect(tweenable._previous).toBe(null);
          expect(tweenable._next).toBe(null);
        });
      });
    });
  });

  describe('two tweenables', () => {
    beforeEach(() => {
      head.tween({});
      tail.tween({});
    });

    describe('adding to the list', () => {
      test('head and tail are linked up', () => {
        expect(getListHead()).toBe(head);
        expect(getListTail()).toBe(tail);
        expect(head._previous).toBe(null);
        expect(head._next).toBe(tail);
        expect(tail._previous).toBe(head);
        expect(tail._next).toBe(null);
      });
    });

    describe('removing from the list', () => {
      describe('removing the head', () => {
        test('orphans the tail', () => {
          head.stop();
          expect(getListHead()).toBe(tail);
          expect(getListTail()).toBe(tail);
          expect(head._previous).toBe(null);
          expect(head._next).toBe(null);
          expect(tail._previous).toBe(null);
          expect(tail._next).toBe(null);
        });
      });

      describe('removing the tail', () => {
        test('orphans the head', () => {
          tail.stop();
          expect(getListHead()).toBe(head);
          expect(getListTail()).toBe(head);
          expect(head._previous).toBe(null);
          expect(head._next).toBe(null);
          expect(tail._previous).toBe(null);
          expect(tail._next).toBe(null);
        });
      });
    });
  });

  describe('more than two tweenables', () => {
    beforeEach(() => {
      head.tween({});
      middle.tween({});
      tail.tween({});
    });

    describe('adding to the list', () => {
      test('nodes are linked up', () => {
        expect(getListHead()).toBe(head);
        expect(getListTail()).toBe(tail);
        expect(head._previous).toBe(null);
        expect(head._next).toBe(middle);
        expect(middle._previous).toBe(head);
        expect(middle._next).toBe(tail);
        expect(tail._previous).toBe(middle);
        expect(tail._next).toBe(null);
      });
    });

    describe('removing from the list', () => {
      describe('removing the middle', () => {
        beforeEach(() => {
          middle.stop();
        });

        test('updates links', () => {
          expect(getListHead()).toBe(head);
          expect(getListTail()).toBe(tail);
          expect(head._previous).toBe(null);
          expect(head._next).toBe(tail);
          expect(middle._previous).toBe(null);
          expect(middle._next).toBe(null);
          expect(tail._previous).toBe(head);
          expect(tail._next).toBe(null);
        });
      });
    });
  });
});
