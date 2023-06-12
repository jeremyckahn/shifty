import { Tweenable, formulas } from './tweenable'

// FIXME: Ensure all @tutorial links work
// FIXME: Document removal of `step`
// FIXME: Document removal of `attachment`
// FIXME: Document removal of tweenable.tweenable (https://github.com/jeremyckahn/shifty/blob/fee93af69c9b4fa9ad462095920adb558ff19ee3/src/tweenable.js#L872-L874)

export type ScheduleFunction = (callback: () => void, timeout: number) => void
// NOTE: TweenState values are numbers whenever they are worked with internally
// by Tweenable. The user may define them as strings, but they get
// automatically converted to numbers before they are processed.
//
// FIXME: Improve the typing to avoid this confusing discrepancy.

export type TweenState = Record<string, number | string>

export type TweenRawState = Record<string, number>

export type Data = object | null
export type StartFunction = (state: TweenState, data: Data) => void
export type FinishFunction = ((data: PromisedData) => void) | null
// FIXME: Reorder data and timeElapsed
/**
 * @param {TweenState} state The current state of the tween.
 * @param {Data} data User-defined `data` provided via a {@link
 * TweenConfig}.
 * @param {number} timeElapsed The time elapsed since the start of the tween.
 */
export type RenderFunction = (
  state: TweenState,
  data: Data,
  timeElapsed: number
) => void

export interface EasingFunction {
  /**
   * @param {number} normalizedPosition The normalized (0-1) position of the
   * tween.
   * @returns {number} The curve-adjusted value.
   */
  (normalizedPosition: number): number
}

export type EasingKey =
  | 'bounce'
  | 'bouncePast'
  | 'easeFrom'
  | 'easeFromTo'
  | 'easeInBack'
  | 'easeInCirc'
  | 'easeInCubic'
  | 'easeInExpo'
  | 'easeInOutBack'
  | 'easeInOutCirc'
  | 'easeInOutCubic'
  | 'easeInOutExpo'
  | 'easeInOutQuad'
  | 'easeInOutQuart'
  | 'easeInOutQuint'
  | 'easeInOutSine'
  | 'easeInQuad'
  | 'easeInQuart'
  | 'easeInQuint'
  | 'easeInSine'
  | 'easeOutBack'
  | 'easeOutBounce'
  | 'easeOutCirc'
  | 'easeOutCubic'
  | 'easeOutExpo'
  | 'easeOutQuad'
  | 'easeOutQuart'
  | 'easeOutQuint'
  | 'easeOutSine'
  | 'easeTo'
  | 'elastic'
  | 'linear'
  | 'swingFrom'
  | 'swingFromTo'
  | 'swingTo'

export type EasingObject = Record<string, EasingKey | EasingFunction>

export type Easing =
  | EasingKey
  | string
  | EasingFunction
  | Record<string, EasingKey | EasingFunction>
  | number[]
export type FulfillmentHandler = (promisedData: PromisedData) => PromisedData
export type RejectionHandler = (promisedData: PromisedData) => PromisedData

export interface PromisedData {
  state: TweenState
  data: Data
  tweenable: Tweenable
}
export interface TweenableConfig {
  /**
   * Starting position.  If omitted, {@link Tweenable#get} is used.
   */
  from?: TweenState

  /**
   * Ending position.  The keys of this Object should match those of `to`.
   */
  to?: TweenState

  /**
   * How many milliseconds to animate for.
   */
  duration?: number

  /**
   * How many milliseconds to wait before starting the tween.
   */
  delay?: number

  /**
   * Executes when the tween begins.
   */
  start?: StartFunction

  /**
   * Executes when the tween completes. This will get overridden by {@link
   * Tweenable#then} if that is called, and it will not fire if {@link
   * Tweenable#cancel} is called.
   */
  finish?: FinishFunction

  /**
   * Executes on every tick. Shifty assumes a [retained
   * mode](https://en.wikipedia.org/wiki/Retained_mode) rendering environment,
   * which in practice means that `render` only gets called when the tween
   * state changes. Importantly, this means that `render` is _not_ called when
   * a tween is not animating (for instance, when it is paused or waiting to
   * start via the `delay` option). This works naturally with DOM environments,
   * but you may need to account for this design in more custom environments
   * such as `<canvas>`.
   */
  render?: RenderFunction

  /**
   * This value can be one of several different types:
   *
   * - `string`: Name of the {@link EasingFunctions} to apply to all properties
   * of the tween.
   * - {@link EasingFunction}: A custom function that computes the rendered
   * position of the tween for the given normalized (0-1) position of the
   * tween.
   * - `Record<string, string | EasingFunction>`: Keys are tween property
   * names. Values are the {@link EasingFunctions} string IDs to be applied to
   * each tween property, or a {@link EasingFunction}. Any tween properties not
   * explicitly included in the `Record` default to `'linear'`.
   * - `Array.<number>`: The array must contain four `number` values that
   * correspond to the `[x1, y1, x2, y2]` values of a [Bezier
   * curve](https://cubic-bezier.com/).
   *
   * You can learn more about this in the {@tutorial easing-function-in-depth}
   * tutorial.
   */
  easing?: Easing

  /**
   * Data that is passed to {@link StartFunction}, {@link RenderFunction}, and
   * {@link PromisedData}.
   */
  data?: Data

  /**
   * Promise implementation constructor for when you want to use Promise
   * library or polyfill Promises in environments where it is not already
   * defined.
   */
  promise?: typeof Promise
}
export interface Filter {
  doesApply: (tweenable: Tweenable) => boolean
  tweenCreated?: (tweenable: Tweenable) => void
  beforeTween?: (tweenable: Tweenable) => void
  afterTween?: (tweenable: Tweenable) => void
  afterTweenEnd?: (tweenable: Tweenable) => void
}
export type FilterName = keyof Omit<Filter, 'doesApply'>

export const isEasingKey = (key: string): key is EasingKey => {
  return key in formulas
}
