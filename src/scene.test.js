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

describe('play', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('plays all Tweenables from their beginning', () => {
    const [tweenable1, tweenable2] = scene.tweenables;
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } });
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } });
    jest.spyOn(tweenable1, 'seek');
    jest.spyOn(tweenable2, 'seek');
    scene.play();

    expect(tweenable1.isPlaying()).toBeTruthy();
    expect(tweenable2.isPlaying()).toBeTruthy();
    expect(tweenable1.seek).toHaveBeenCalledWith(0);
    expect(tweenable2.seek).toHaveBeenCalledWith(0);
  });
});

describe('pause', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('pauses all Tweenables', () => {
    const [tweenable1, tweenable2] = scene.tweenables;
    tweenable1.tween({ from: { x: 0 }, to: { x: 10 } });
    tweenable2.tween({ from: { x: 10 }, to: { x: 0 } });
    scene.pause();

    expect(scene.isPlaying()).toBeFalsy();
  });
});

describe('resume', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('resumes all Tweenables', () => {
    const [tweenable1, tweenable2] = scene.tweenables;
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } });
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } });
    jest.spyOn(tweenable1, 'resume');
    jest.spyOn(tweenable2, 'resume');
    scene.resume();

    expect(tweenable1.resume).toHaveBeenCalled();
    expect(tweenable2.resume).toHaveBeenCalled();
  });
});

describe('stop', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('stops all Tweenables', () => {
    const [tweenable1, tweenable2] = scene.tweenables;
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } });
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } });
    jest.spyOn(tweenable1, 'stop');
    jest.spyOn(tweenable2, 'stop');
    scene.stop(true);

    expect(tweenable1.stop).toHaveBeenCalledWith(true);
    expect(tweenable2.stop).toHaveBeenCalledWith(true);
  });
});

describe('seek', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('seeks all Tweenables to specified millisecond', () => {
    const [tweenable1, tweenable2] = scene.tweenables;
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } });
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } });
    jest.spyOn(tweenable1, 'seek');
    jest.spyOn(tweenable2, 'seek');
    scene.seek(250);

    expect(tweenable1.seek).toHaveBeenCalledWith(250);
    expect(tweenable2.seek).toHaveBeenCalledWith(250);
  });
});
