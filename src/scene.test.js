import { Tweenable } from './tweenable';
import { Scene } from './scene';

let scene;

describe('constructor', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable());
  });

  test('stores internal Tweenables', () => {
    expect(scene.tweenables).toEqual([new Tweenable(), new Tweenable()]);
  });
});
