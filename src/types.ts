import { Tweenable } from './tweenable'
import { easingFunctions } from './easing-functions'

export type ScheduleFunction = (callback: () => void, timeout: number) => void

// NOTE: TweenState values are numbers whenever they are worked with internally
// by Tweenable. The user may define them as strings, but they get
// automatically converted to numbers before they are processed.

export type TweenState = Record<string, number | string>

export type TweenRawState = Record<string, number>

/**
 * Arbitrary data that can be provided to a {@link Tweenable} via {@link
 * Tweenable#setConfig} and {@link Tweenable#tween}. This data is provided to a
 * tween's {@link RenderFunction render handler}.
 */
export type Data = object | null

/**
 * @param {TweenState} state The current state of the tween.
 * @param {Data} [data] User-defined data provided via a {@link TweenableConfig}.
 */
export type StartFunction = (state: TweenState, data: Data) => void

export type FinishFunction = ((data: PromisedData) => void) | null

// FIXME: Reorder data and timeElapsed
/**
 * Gets called for every tick of the tween.  This function is not called on the
 * final tick of the animation.
 * @param {TweenState} state The current state of the tween.
 * @param {Data} data User-defined `data` provided via a {@link
 * TweenableConfig}.
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

export type EasingKey = keyof typeof easingFunctions

export type EasingObject = Record<string, EasingKey | EasingFunction>

export type Easing =
  | EasingKey
  | string
  | EasingFunction
  | EasingObject
  | number[]
export type FulfillmentHandler = (promisedData: PromisedData) => PromisedData

export type RejectionHandler = (promisedData: PromisedData) => PromisedData

/**
 * @property {TweenState} state The current state of the tween.
 * @property {Data} data The `data` object that the tween was configured with.
 * @property {Tweenable} tweenable The {@link Tweenable} instance to which the
 * tween belongs.
 */
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
   * - `string`: Name of the {@link easingFunctions} to apply to all properties
   * of the tween.
   * - {@link EasingFunction}: A custom function that computes the rendered
   * position of the tween for the given normalized (0-1) position of the
   * tween.
   * - `Record<string, string | EasingFunction>`: Keys are tween property
   * names. Values are the {@link easingFunctions} string IDs to be applied to
   * each tween property, or a {@link EasingFunction}. Any tween properties not
   * explicitly included in the `Record` default to `'linear'`.
   * - `Array.<number>`: The array must contain four `number` values that
   * correspond to the `[x1, y1, x2, y2]` values of a [Bezier
   * curve](https://cubic-bezier.com/).
   *
   * You can learn more about this in the {@page
   * ../tutorials/easing-function-in-depth.md} tutorial.
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

/**
 * An object that contains functions that are called at key points in a tween's
 * lifecycle.  Shifty can only process `Number`s internally, but filters can
 * expand support for any type of data.  This is the mechanism that powers
 * {@page ../tutorials/string-interpolation.md}.
 */
export interface Filter {
  /**
   * This is called when a tween is created to determine if a filter is needed.
   * Filters are only added to a tween when it is created so that they are not
   * unnecessarily processed if they don't apply during a subsequent update
   * tick.
   */
  doesApply: (tweenable: Tweenable) => boolean

  /**
   * This is called when a tween is created.  This should perform any setup
   * needed by subsequent per-tick calls to {@link Filter.beforeTween} and
   * {@link Filter.afterTween}.
   */
  tweenCreated?: (tweenable: Tweenable) => void

  /**
   * This is called right before a tween is processed in a tick.
   */
  beforeTween?: (tweenable: Tweenable) => void

  /**
   * This is called right after a tween is processed in a tick.
   */
  afterTween?: (tweenable: Tweenable) => void

  /**
   * This is called right after a tween is completed.
   */
  afterTweenEnd?: (tweenable: Tweenable) => void
}

export type FilterName = keyof Omit<Filter, 'doesApply'>

export const isEasingKey = (key: string): key is EasingKey => {
  return key in Tweenable.easing
}
