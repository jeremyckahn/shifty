import { Tweenable } from './tweenable';
import { Scene } from './scene';

let scene;

beforeEach(() => {
  scene = new Scene();
});

describe('constructor', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('stores internal Tweenables', () => {
    expect(scene.tweenables).toEqual([new Tweenable(), new Tweenable()]);
  });
});

describe('addTweenable', () => {
  test('adds a Tweenable', () => {
    const tweenable = scene.addTweenable(new Tweenable());
    expect(scene.tweenables).toEqual([tweenable]);
  });
});

describe('removeTweenable', () => {
  test('removes a Tweenable', () => {
    const tweenable1 = new Tweenable({ foo: 1 });
    const tweenable2 = new Tweenable({ bar: 1 });
    scene = new Scene(tweenable1, tweenable2);
    const removedTweenable = scene.removeTweenable(tweenable1);

    expect(removedTweenable).toEqual(tweenable1);
    expect(scene.tweenables).toEqual([tweenable2]);
  });
});

describe('isPlaying', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('returns false if no tweenables are playing', () => {
    expect(scene.isPlaying()).toBeFalsy();
  });

  test('returns true if any Tweenables are playing', () => {
    scene.tweenables[1].tween({ from: { x: 0 }, to: { x: 10 } });
    expect(scene.isPlaying()).toBeTruthy();
  });
});
