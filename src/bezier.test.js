import {
  Tweenable,
  interpolate,
  setBezierFunction,
  unsetBezierFunction,
} from './'

test('can create a linear bezier easing curve', () => {
  setBezierFunction('bezier-linear', 0.25, 0.25, 0.75, 0.75)

  expect(interpolate({ x: 0 }, { x: 10 }, 0.25, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.25, 'bezier-linear').x.toFixed(1)
  )
  expect(interpolate({ x: 0 }, { x: 10 }, 0.5, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.5, 'bezier-linear').x.toFixed(1)
  )
  expect(interpolate({ x: 0 }, { x: 10 }, 0.75, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.75, 'bezier-linear').x.toFixed(1)
  )
})

test('can create a "stretched" linear bezier easing curve', () => {
  setBezierFunction('bezier-stretched-linear', 0, 0, 1, 1)

  expect(interpolate({ x: 0 }, { x: 10 }, 0.25, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.25, 'bezier-stretched-linear').x.toFixed(
      1
    )
  )
  expect(interpolate({ x: 0 }, { x: 10 }, 0.5, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.5, 'bezier-stretched-linear').x.toFixed(
      1
    )
  )
  expect(interpolate({ x: 0 }, { x: 10 }, 0.75, 'linear').x.toFixed(1)).toEqual(
    interpolate({ x: 0 }, { x: 10 }, 0.75, 'bezier-stretched-linear').x.toFixed(
      1
    )
  )
})

test('can remove a bezier easing curve', () => {
  setBezierFunction('bezier-linear', 0, 0, 1, 1)
  unsetBezierFunction('bezier-linear')
  expect(!Tweenable.prototype['bezier-linear']).toBeTruthy()
})

test('bezier handle positions are stored on a custom easing function', () => {
  const easingFunction = setBezierFunction(
    'decoration-test',
    0.2,
    0.4,
    0.6,
    0.8
  )

  expect(easingFunction.displayName).toEqual('decoration-test')
  expect(easingFunction.x1).toEqual(0.2)
  expect(easingFunction.y1).toEqual(0.4)
  expect(easingFunction.x2).toEqual(0.6)
  expect(easingFunction.y2).toEqual(0.8)
})
