import { Tweenable, composeEasingObject, tweenProps } from './tweenable'
/** @typedef {import("./index").shifty.easingFunction} shifty.easingFunction */

// Fake a Tweenable and patch some internals.  This approach allows us to
// skip uneccessary processing and object recreation, cutting down on garbage
// collection pauses.
const mockTweenable = new Tweenable()
const { filters } = Tweenable

/**
 * Compute the midpoint of two Objects.  This method effectively calculates a
 * specific frame of animation that {@link Tweenable#tween} does many times
 * over the course of a full tween.
 *
 * ```
 * import { interpolate } from 'shifty';
 *
 * const interpolatedValues = interpolate({
 *     width: '100px',
 *     opacity: 0,
 *     color: '#fff'
 *   }, {
 *     width: '200px',
 *     opacity: 1,
 *     color: '#000'
 *   },
 *   0.5
 * );
 *
 * console.log(interpolatedValues); // Logs: {opacity: 0.5, width: "150px", color: "rgb(127,127,127)"}
 * ```
 *
 * @method shifty.interpolate
 * @template T
 * @param {T} from The starting values to tween from.
 * @param {T} to The ending values to tween to.
 * @param {number} position The normalized position value (between `0.0` and
 * `1.0`) to interpolate the values between `from` and `to` for.  `from`
 * represents `0` and `to` represents `1`.
 * @param {Record<string, string | shifty.easingFunction> | string | shifty.easingFunction} easing
 * The easing curve(s) to calculate the midpoint against.  You can
 * reference any easing function attached to {@link Tweenable.formulas},
 * or provide the {@link shifty.easingFunction}(s) directly.  If omitted, this
 * defaults to "linear".
 * @param {number} [delay=0] Optional delay to pad the beginning of the
 * interpolated tween with.  This increases the range of `position` from (`0`
 * through `1`) to (`0` through `1 + delay`).  So, a delay of `0.5` would
 * increase all valid values of `position` to numbers between `0` and `1.5`.
 * @return {T}
 */
export const interpolate = (from, to, position, easing, delay = 0) => {
  const current = { ...from }
  const easingObject = composeEasingObject(from, easing)

  mockTweenable._filters.length = 0

  mockTweenable.set({})
  mockTweenable._currentState = current
  mockTweenable._originalState = from
  mockTweenable._targetState = to
  mockTweenable._easing = easingObject

  for (const name in filters) {
    if (filters[name].doesApply(mockTweenable)) {
      mockTweenable._filters.push(filters[name])
    }
  }

  // Any defined value transformation must be applied
  mockTweenable._applyFilter('tweenCreated')
  mockTweenable._applyFilter('beforeTween')

  const interpolatedValues = tweenProps(
    position,
    current,
    from,
    to,
    1,
    delay,
    easingObject
  )

  // Transform data in interpolatedValues back into its original format
  mockTweenable._applyFilter('afterTween')

  return interpolatedValues
}
