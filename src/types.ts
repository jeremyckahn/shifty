import { Tweenable } from './tweenable'
import { easingFunctions } from './easing-functions'

/**
 * Asynchronous scheduling function. By default this is
 * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
 * when available and {@link !setTimeout} when not.
 */
export type ScheduleFunction = (callback: () => void, timeout?: number) => void

// NOTE: TweenState values are numbers whenever they are worked with internally
// by Tweenable. The user may define them as strings, but they get
// automatically converted to numbers before they are processed.

/**
 * A tween's starting, beginning, and mid-point state.
 */
export type TweenState = Record<string, number | string>

/**
 * @ignore
 */
export type TweenRawState = Record<string, number>

/**
 * Arbitrary data that can be provided to a {@link Tweenable} via {@link
 * Tweenable#setConfig} and {@link Tweenable#tween}. This data is provided to a
 * tween's {@link RenderFunction render handler}.
 */
export type Data = object | null

/**
 * This is called when a tween is started.
 * @param {TweenState} state The current state of the tween.
 * @param {Data} [data] User-defined data provided via a {@link TweenableConfig}.
 */
export type StartFunction = (state: TweenState, data: Data) => void

/**
 * This is called when a tween is completed.
 */
export type FinishFunction = ((promisedData: PromisedData) => void) | null

/**
 * Gets called for every tick of the tween.
 * @param {TweenState} state The current state of the tween.
 * @param {number} timeElapsed The time elapsed since the start of the tween.
 * @param {Data} data User-defined `data` provided via a {@link
 * TweenableConfig}.
 */
export type RenderFunction = (
  state: TweenState,
  timeElapsed: number,
  data: Data
) => void

/**
 * A function used to compute the state of a tween against a curve.
 * @returns {number} The curve-adjusted value.
 */
export interface EasingFunction {
  (
    /**
     * The normalized (0-1) position of the tween.
     */
    normalizedPosition: number
  ): number
  /**
   * @ignore
   */
  displayName?: string
  /**
   * @ignore
   */
  x1?: number
  /**
   * @ignore
   */
  y1?: number
  /**
   * @ignore
   */
  x2?: number
  /**
   * @ignore
   */
  y2?: number
}

/**
 * A string identifier of an easing curve to use for an animation. Here are the
 * available key names provided by default:
 * <p data-height="965" data-theme-id="0" data-slug-hash="wqObdO"
 * data-default-tab="result" data-user="jeremyckahn" data-embed-version="2"
 * data-pen-title="Shifty - Easing curve names" class="codepen">See the Pen <a
 * href="https://codepen.io/jeremyckahn/pen/wqObdO/">Shifty - Easing curve
 * names</a> by Jeremy Kahn (<a
 * href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a
 * href="https://codepen.io">CodePen</a>.</p> <script async
 * src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
 */
export type EasingKey = keyof typeof easingFunctions

/**
 * A map of {@link TweenState} property names to the easing identifier or
 * implementations to animate them with. Omitted property names default to
 * linear easing.
 */
export type EasingObject = Record<keyof TweenState, EasingKey | EasingFunction>

/**
 * A user-specified easing identifier or implementation.
 */
export type Easing =
  | EasingKey
  | string
  | EasingFunction
  | EasingObject
  | number[]

/**
 * {@link !Promise} resolution handler.
 */
export type FulfillmentHandler = (promisedData: PromisedData) => PromisedData

/**
 * {@link !Promise} rejection handler.
 */
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

/**
 * Determines whether or not a given string represents a defined easing curve
 * on {@link Tweenable.easing}. This also handles custom easing functions.
 */
export const isEasingKey = (key: string): key is EasingKey => {
  return key in Tweenable.easing
}
