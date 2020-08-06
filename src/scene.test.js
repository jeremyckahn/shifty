import { Tweenable } from './tweenable'
import { Scene } from './scene'

let scene

beforeEach(() => {
  scene = new Scene()
})

describe('constructor', () => {
  test('stores internal Tweenables', () => {
    scene = new Scene(new Tweenable(), new Tweenable())
    const [tweenable1, tweenable2] = scene.tweenables

    expect(scene.tweenables).toHaveLength(2)
    expect(tweenable1).toBeInstanceOf(Tweenable)
    expect(tweenable2).toBeInstanceOf(Tweenable)
  })
})

describe('get promises', () => {
  test('returns promises for all tweenables', () => {
    scene = new Scene(new Tweenable({}, {}))
    const { promises } = scene
    expect(promises).toHaveLength(1)
    expect(promises[0]).toBeInstanceOf(Promise)
  })
})

describe('add', () => {
  test('adds a Tweenable', () => {
    const tweenable1 = scene.add(new Tweenable())
    const tweenable2 = scene.add(new Tweenable())
    expect(scene.tweenables[0]).toEqual(tweenable1)
    expect(scene.tweenables[1]).toEqual(tweenable2)
  })
})

describe('remove', () => {
  test('removes a Tweenable', () => {
    const tweenable1 = new Tweenable({ foo: 1 })
    const tweenable2 = new Tweenable({ bar: 1 })
    scene = new Scene(tweenable1, tweenable2)
    const removedTweenable = scene.remove(tweenable1)

    expect(removedTweenable).toEqual(tweenable1)
    expect(scene.tweenables).toEqual([tweenable2])
  })
})

describe('empty', () => {
  test('removes all Tweenables', () => {
    const tweenable1 = new Tweenable({ foo: 1 })
    const tweenable2 = new Tweenable({ bar: 1 })
    scene = new Scene(tweenable1, tweenable2)
    const emptiedTweenables = scene.empty(tweenable1)

    expect(scene.tweenables).toHaveLength(0)
    expect(emptiedTweenables).toEqual([tweenable1, tweenable2])
  })
})

describe('isPlaying', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable())
  })

  test('returns false if no tweenables are playing', () => {
    expect(scene.isPlaying()).toBeFalsy()
  })

  test('returns true if any Tweenables are playing', () => {
    scene.tweenables[1].tween({ from: { x: 0 }, to: { x: 10 } })
    expect(scene.isPlaying()).toBeTruthy()
  })
})

describe('play', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable())
  })

  test('plays all Tweenables from their beginning', () => {
    const [tweenable1, tweenable2] = scene.tweenables
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } })
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } })
    scene.play()

    expect(tweenable1.isPlaying()).toBeTruthy()
    expect(tweenable2.isPlaying()).toBeTruthy()
  })
})

describe('pause', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable())
  })

  test('pauses all Tweenables', () => {
    scene.play()
    scene.pause()

    expect(scene.isPlaying()).toBeFalsy()
  })
})

describe('resume', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable())
  })

  test('resumes all Tweenables', () => {
    scene.play()
    scene.pause()
    scene.resume()

    expect(scene.isPlaying()).toBeTruthy()
  })
})

describe('stop', () => {
  beforeEach(() => {
    scene = new Scene(new Tweenable(), new Tweenable())
  })

  test('stops all Tweenables', () => {
    const [tweenable1, tweenable2] = scene.tweenables
    tweenable1.setConfig({ from: { x: 0 }, to: { x: 10 } })
    tweenable2.setConfig({ from: { x: 10 }, to: { x: 0 } })
    jest.spyOn(tweenable1, 'stop')
    jest.spyOn(tweenable2, 'stop')
    scene.stop(true)

    expect(tweenable1.stop).toHaveBeenCalledWith(true)
    expect(tweenable2.stop).toHaveBeenCalledWith(true)
  })
})
