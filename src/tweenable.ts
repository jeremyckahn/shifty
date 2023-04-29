import EasingFunctions from './easing-functions'
import { getCubicBezierTransition } from './bezier'
/** @typedef {import("./index").shifty.filter} shifty.filter */
/** @typedef {import("./index").shifty.scheduleFunction} shifty.scheduleFunction */

// FIXME: Ensure all @tutorial links work
// FIXME: Replace `unknown`s with generic types

// CONSTANTS
const DEFAULT_EASING = 'linear'
const DEFAULT_DURATION = 500
const UPDATE_TIME = 1000 / 60
const root = typeof window !== 'undefined' ? window : global

const AFTER_TWEEN = 'afterTween'
const AFTER_TWEEN_END = 'afterTweenEnd'
const BEFORE_TWEEN = 'beforeTween'
const TWEEN_CREATED = 'tweenCreated'
const TYPE_FUNCTION = 'function'
const TYPE_STRING = 'string'

// requestAnimationFrame() shim by Paul Irish (modified for Shifty)
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
let scheduleFunction = root.requestAnimationFrame

if (!scheduleFunction) {
  if (typeof window === 'undefined') {
    scheduleFunction = setTimeout
  } else {
    scheduleFunction =
      window.webkitRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      (window.mozCancelRequestAnimationFrame &&
        window.mozRequestAnimationFrame) ||
      setTimeout
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

let listHead: Tweenable | null = null
let listTail: Tweenable | null = null

type TweenState = Record<string, number>

type StartFunction = (data: unknown) => void

type FinishFunction = (data: unknown) => void

// FIXME: Reorder data and timeElapsed
/**
 * @param {TweenState} state The current state of the tween.
 * @param {unknown} data User-defined `data` provided via a {@link
 * TweenConfig}.
 * @param {number} timeElapsed The time elapsed since the start of the tween.
 */
type RenderFunction = (
  state: TweenState,
  data: unknown,
  timeElapsed: number
) => void

/**
 * @param {number} position The normalized (0-1) position of the tween.
 * @returns {number} The curve-adjusted value.
 */
type EasingFunction = (normalizedPosition: number) => number

type FulfillmentHandler = (promisedData: PromisedData) => void
type RejectionHandler = (promisedData: PromisedData) => void

interface PromisedData {
  state: TweenState
  // FIXME: Improve this typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object: any
}

interface TweenableConfig {
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
  easing?:
    | string
    | EasingFunction
    | Record<string, string | EasingFunction>
    | number[]

  /**
   * Data that is passed to {@link StartFunction}, {@link RenderFunction}, and
   * {@link PromisedData}.
   */
  data?: unknown

  /**
   * Promise implementation constructor for when you want to use Promise
   * library or polyfill Promises in environments where it is not already
   * defined.
   */
  promise?: typeof Promise
}

/**
 * Strictly for testing.
 * @private
 * @internal
 */
export const resetList = () => {
  listHead = listTail = null
}

/**
 * Strictly for testing.
 * @returns {Tweenable}
 * @private
 * @internal
 */
export const getListHead = (): Tweenable | null => listHead

/**
 * Strictly for testing.
 * @returns {Tweenable}
 * @private
 * @internal
 */
export const getListTail = (): Tweenable | null => listTail

type FilterFunction = (tweenable: Tweenable) => void

const formulas = { ...EasingFunctions }

/**
 * Calculates the interpolated tween values of an Object for a given
 * timestamp.
 * @param {number} forPosition The position to compute the state for.
 * @param {Object} currentState Current state properties.
 * @param {Object} originalState: The original state properties the Object is
 * tweening from.
 * @param {Object} targetState: The destination state properties the Object
 * is tweening to.
 * @param {number} duration: The length of the tween in milliseconds.
 * @param {number} timestamp: The UNIX epoch time at which the tween began.
 * @param {Record<string, string|Function>} easing: This Object's keys must correspond
 * to the keys in targetState.
 * @returns {Object}
 * @private
 */
export const tweenProps = (
  forPosition: number, // The position to compute the state for.
  currentState: TweenState,
  originalState: TweenState,
  targetState: TweenState,
  duration: number,
  timestamp: number,
  easing: Record<string, keyof EasingFunctions | EasingFunction>
): object => {
  let easedPosition = 0
  let start: number

  const normalizedPosition =
    forPosition < timestamp ? 0 : (forPosition - timestamp) / duration

  let easingFn: EasingFunction
  let hasOneEase = false

  if (easing instanceof Function) {
    hasOneEase = true
    easedPosition = easing(normalizedPosition)
  }

  for (const key in currentState) {
    if (!hasOneEase) {
      const easingObjectProp = easing[key]

      if (easingObjectProp instanceof Function) {
        easingFn = easingObjectProp
      } else {
        easingFn = formulas[easingObjectProp]
      }

      easedPosition = easingFn(normalizedPosition)
    }

    start = originalState[key]

    currentState[key] = start + (targetState[key] - start) * easedPosition
  }

  return currentState
}

const processTween = (tween: Tweenable, currentTime: number) => {
  let timestamp = tween._timestamp
  const currentState = tween._currentState
  const delay = tween._delay

  if (currentTime < timestamp + delay) {
    return
  }

  let duration = tween._duration
  const targetState = tween._targetState

  const endTime = timestamp + delay + duration
  let timeToCompute = currentTime > endTime ? endTime : currentTime
  tween._hasEnded = timeToCompute >= endTime
  const offset = duration - (endTime - timeToCompute)
  const hasFilters = tween._filters.length > 0

  if (tween._hasEnded) {
    tween._render(targetState, tween._data, offset)
    return tween.stop(true)
  }

  if (hasFilters) {
    tween._applyFilter(BEFORE_TWEEN)
  }

  // If the animation has not yet reached the start point (e.g., there was
  // delay that has not yet completed), just interpolate the starting
  // position of the tween.
  if (timeToCompute < timestamp + delay) {
    timestamp = duration = timeToCompute = 1
  } else {
    timestamp += delay
  }

  tweenProps(
    timeToCompute,
    currentState,
    tween._originalState,
    targetState,
    duration,
    timestamp,
    tween._easing
  )

  if (hasFilters) {
    tween._applyFilter(AFTER_TWEEN)
  }

  tween._render(currentState, tween._data, offset)
}

/**
 * Process all tweens currently managed by Shifty for the current tick. This
 * does not perform any timing or update scheduling; it is the logic that is
 * run *by* the scheduling functionality. Specifically, it computes the state
 * and calls all of the relevant {@link TweenableConfig} functions supplied to each
 * of the tweens for the current point in time (as determined by {@link
 * Tweenable.now}.
 *
 * This is a low-level API that won't be needed in the majority of situations.
 * It is primarily useful as a hook for higher-level animation systems that are
 * built on top of Shifty. If you need this function, it is likely you need to
 * pass something like `() => {}` to {@link
 * Tweenable.setScheduleFunction}, override {@link Tweenable.now}
 * and manage the scheduling logic yourself.
 *
 * @method shifty.processTweens
 * @see https://github.com/jeremyckahn/shifty/issues/109
 */
export const processTweens = () => {
  let nextTweenToProcess

  const currentTime = Tweenable.now()
  let currentTween = listHead

  while (currentTween) {
    nextTweenToProcess = currentTween._next
    processTween(currentTween, currentTime)
    currentTween = nextTweenToProcess
  }
}

const getCurrentTime = Date.now || (() => +new Date())
let now
let heartbeatIsRunning = false

/**
 * Determines whether or not a heartbeat tick should be scheduled. This is
 * generally only useful for testing environments where Shifty's continuous
 * heartbeat mechanism causes test runner issues.
 *
 * If you are using Jest, you'll want to put this in a global `afterAll` hook.
 * If you don't already have a Jest setup file, follow the setup in [this
 * StackOverflow post](https://stackoverflow.com/a/57647146), and then add this
 * to it:
 *
 * ```
 * import { shouldScheduleUpdate } from 'shifty'
 *
 * afterAll(() => {
 *   shouldScheduleUpdate(false)
 * })
 * ```
 *
 * @method shifty.shouldScheduleUpdate
 * @param {boolean} doScheduleUpdate
 * @see https://github.com/jeremyckahn/shifty/issues/156
 */
export const shouldScheduleUpdate = (doScheduleUpdate: boolean) => {
  if (doScheduleUpdate && heartbeatIsRunning) {
    return
  }

  heartbeatIsRunning = doScheduleUpdate

  if (doScheduleUpdate) {
    scheduleUpdate()
  }
}

/**
 * Handles the update logic for one tick of a tween.
 * @private
 */
export const scheduleUpdate = () => {
  now = getCurrentTime()

  if (heartbeatIsRunning) {
    scheduleFunction.call(root, scheduleUpdate, UPDATE_TIME)
  }

  processTweens()
}

/**
 * Creates a usable easing Object from a string, a function or another easing
 * Object.  If `easing` is an Object, then this function clones it and fills
 * in the missing properties with `"linear"`.
 *
 * If the tween has only one easing across all properties, that function is
 * returned directly.
 * @param {Record<string, string|Function>} fromTweenParams
 * @param {Object|string|Function|Array.<number>} [easing]
 * @param {Object} [composedEasing] Reused composedEasing object (used internally)
 * @return {Record<string, string|Function>|Function}
 * @private
 */
export const composeEasingObject = (
  fromTweenParams: Record<string, string | Function>,
  easing: object | string | Function | Array<number> = DEFAULT_EASING,
  composedEasing: object = {}
): Record<string, string | Function> | Function => {
  if (Array.isArray(easing)) {
    const cubicBezierTransition = getCubicBezierTransition(...easing)

    return cubicBezierTransition
  }

  const typeofEasing = typeof easing

  if (formulas[easing]) {
    return formulas[easing]
  }

  if (typeofEasing === TYPE_STRING || typeofEasing === TYPE_FUNCTION) {
    for (const prop in fromTweenParams) {
      composedEasing[prop] = easing
    }
  } else {
    for (const prop in fromTweenParams) {
      composedEasing[prop] = easing[prop] || DEFAULT_EASING
    }
  }

  return composedEasing
}

// Private declarations used below

const remove = ((previousTween, nextTween) => tween => {
  // Adapted from:
  // https://github.com/trekhleb/javascript-algorithms/blob/7c9601df3e8ca4206d419ce50b88bd13ff39deb6/src/data-structures/doubly-linked-list/DoublyLinkedList.js#L73-L121
  if (tween === listHead) {
    listHead = tween._next

    if (listHead) {
      listHead._previous = null
    } else {
      listTail = null
    }
  } else if (tween === listTail) {
    listTail = tween._previous

    if (listTail) {
      listTail._next = null
    } else {
      listHead = null
    }
  } else {
    previousTween = tween._previous
    nextTween = tween._next

    previousTween._next = nextTween
    nextTween._previous = previousTween
  }

  // Clean up any references in case the tween is restarted later.
  tween._previous = tween._next = null
})()

const defaultPromiseCtor = typeof Promise === 'function' ? Promise : null

/**
 * @class
 * @implements {Promise<unknown>}
 */
export class Tweenable {
  //required for Promise implementation
  [Symbol.toStringTag] = 'Promise'
  /**
   * @method Tweenable.now
   * @static
   * @returns {number} The current timestamp.
   */
  static now = (): number => now

  /**
   * Set a custom schedule function.
   *
   * By default,
   * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
   * is used if available, otherwise
   * [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout)
   * is used.
   * @method Tweenable.setScheduleFunction
   * @param {shifty.scheduleFunction} fn The function to be
   * used to schedule the next frame to be rendered.
   * @return {shifty.scheduleFunction} The function that was set.
   */
  static setScheduleFunction = (
    fn: shifty.scheduleFunction
  ): shifty.scheduleFunction => (scheduleFunction = fn)

  /**
   * The {@link shifty.filter}s available for use.  These filters are
   * automatically applied at tween-time by Shifty. You can define your own
   * {@link shifty.filter}s and attach them to this object.
   * @member Tweenable.filters
   * @type {Record<string, shifty.filter>}
   */
  static filters: Record<string, shifty.filter> = {}

  static formulas = formulas

  _next: Tweenable | null = null

  _previous: Tweenable | null = null

  _config: TweenableConfig

  _data: unknown

  _delay: number

  _filters: FilterFunction[]

  _timestamp: number | null

  _hasEnded: boolean

  _resolve: ((tweenable: Tweenable) => void) | null

  _reject: ((tweenable: Tweenable) => void) | null

  _currentState: TweenState

  _originalState: TweenState

  _targetState: TweenState

  _start: StartFunction

  _render: RenderFunction

  _promiseCtor: typeof Promise | null

  /**
   * @param {TweenState} [initialState={}] The values that the initial tween should
   * start at if a `from` value is not provided to {@link
   * Tweenable#tween} or {@link Tweenable#setConfig}.
   * @param {TweenableConfig} [config] Configuration object to be passed to
   * {@link Tweenable#setConfig}.
   * @constructs Tweenable
   * @memberof shifty
   */
  constructor(initialState: TweenState = {}, config: TweenableConfig) {
    /** @private */
    this._config = {}
    /** @private */
    this._data = {}
    /** @private */
    this._delay = 0
    /** @private */
    this._filters = []
    /** @private */
    this._next = null
    /** @private */
    this._previous = null
    /** @private */
    this._timestamp = null
    /** @private */
    this._hasEnded = false
    /** @private */
    this._resolve = null
    /** @private */
    this._reject = null
    /** @private */
    this._currentState = initialState || {}
    /** @private */
    this._originalState = {}
    /** @private */
    this._targetState = {}
    /** @private */
    this._start = noop
    /** @private */
    this._render = noop
    /** @private */
    this._promiseCtor = defaultPromiseCtor

    // To prevent unnecessary calls to setConfig do not set default
    // configuration here.  Only set default configuration immediately before
    // tweening if none has been set.
    if (config) {
      this.setConfig(config)
    }
  }

  /**
   * Applies a filter to Tweenable instance.
   * @param {string} filterName The name of the filter to apply.
   * @private
   */
  _applyFilter(filterName: string) {
    for (let i = this._filters.length; i > 0; i--) {
      const filterType = this._filters[i - i]
      const filter = filterType[filterName]

      if (filter) {
        filter(this)
      }
    }
  }

  /**
   * Configure and start a tween. If this {@link Tweenable}'s instance
   * is already running, then it will stop playing the old tween and
   * immediately play the new one.
   * @method Tweenable#tween
   * @param {TweenableConfig} [config] Gets passed to {@link Tweenable#setConfig}.
   * @returns {Tweenable}
   */
  tween(config?: TweenableConfig): Tweenable {
    if (this._isPlaying) {
      this.stop()
    }

    if (config || !this._config) {
      this.setConfig(config)
    }

    /** @private */
    this._pausedAtTime = null
    this._timestamp = Tweenable.now()
    this._start(this.get(), this._data)

    if (this._delay) {
      this._render(this._currentState, this._data, 0)
    }

    return this._resume(this._timestamp)
  }

  /**
   * Configure a tween that will start at some point in the future. Aside from
   * `delay`, `from`, and `to`, each configuration option will automatically
   * default to the same option used in the preceding tween of this {@link
   * Tweenable} instance.
   * @method Tweenable#setConfig
   * @param {TweenableConfig} [config={}]
   * @return {Tweenable}
   */
  setConfig(config: TweenableConfig = {}): Tweenable {
    const { _config } = this

    for (const key in config) {
      _config[key] = config[key]
    }

    // Configuration options to reuse from previous tweens
    const {
      promise = this._promiseCtor,
      start = noop,
      finish,
      render = this._config.step || noop,

      // Legacy option. Superseded by `render`.
      step = noop,
    } = _config

    // Attach something to this Tweenable instance (e.g.: a DOM element, an
    // object, a string, etc.);
    this._data = _config.data || _config.attachment || this._data // FIXME: Remove `attachment`

    // Init the internal state
    /** @private */
    this._isPlaying = false
    /** @private */
    this._pausedAtTime = null
    /** @private */
    this._scheduleId = null
    /** @private */
    this._delay = config.delay || 0
    /** @private */
    this._start = start
    /** @private */
    this._render = render || step // FIXME: Remove step
    /** @private */
    this._duration = _config.duration || DEFAULT_DURATION
    /** @private */
    this._promiseCtor = promise

    if (finish) {
      this._resolve = finish
    }

    const { from, to = {} } = config
    const { _currentState, _originalState, _targetState } = this

    for (const key in from) {
      _currentState[key] = from[key]
    }

    let anyPropsAreStrings = false

    for (const key in _currentState) {
      const currentProp = _currentState[key]

      if (!anyPropsAreStrings && typeof currentProp === TYPE_STRING) {
        anyPropsAreStrings = true
      }

      _originalState[key] = currentProp

      // Ensure that there is always something to tween to.
      _targetState[key] = to.hasOwnProperty(key) ? to[key] : currentProp
    }

    /** @private */
    this._easing = composeEasingObject(
      this._currentState,
      _config.easing,
      this._easing
    )

    this._filters.length = 0

    if (anyPropsAreStrings) {
      for (const key in Tweenable.filters) {
        if (Tweenable.filters[key].doesApply(this)) {
          this._filters.push(Tweenable.filters[key])
        }
      }

      this._applyFilter(TWEEN_CREATED)
    }

    return this
  }

  /**
   * Overrides any `finish` function passed via a {@link TweenableConfig}.
   * @method Tweenable#then
   * @param {function=} onFulfilled Receives {@link shifty.promisedData} as the
   * first parameter.
   * @param {function=} onRejected Receives {@link shifty.promisedData} as the
   * first parameter.
   * @return {Promise<Object>}
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
   */
  then(
    onFulfilled?: FulfillmentHandler,
    onRejected?: RejectionHandler
  ): Promise<TweenState> {
    /** @private */
    this._promise = new this._promiseCtor((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })

    return this._promise.then(onFulfilled, onRejected)
  }

  /**
   * @method Tweenable#catch
   * @param {function} onRejected Receives {@link shifty.promisedData} as the
   * first parameter.
   * @return {Promise<Object>}
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
   */
  catch(onRejected: RejectionHandler): Promise<TweenState> {
    return this.then().catch(onRejected)
  }
  /**
   * @method Tweenable#finally
   * @param {function} onFinally
   * @return {Promise<undefined>}
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
   */
  finally(onFinally: () => TweenState): Promise<TweenState> {
    return this.then().finally(onFinally)
  }

  /**
   * @method Tweenable#get
   * @return {Object} The current state.
   */
  get(): object {
    return { ...this._currentState }
  }

  /**
   * Set the current state.
   * @method Tweenable#set
   * @param {Object} state The state to set.
   */
  set(state: object) {
    this._currentState = state
  }

  /**
   * Pause a tween. Paused tweens can be resumed from the point at which they
   * were paused. If a tween is not running, this is a no-op.
   * @method Tweenable#pause
   * @return {Tweenable}
   */
  pause(): Tweenable {
    if (!this._isPlaying) {
      return
    }

    this._pausedAtTime = Tweenable.now()
    this._isPlaying = false
    remove(this)

    return this
  }

  /**
   * Resume a paused tween.
   * @method Tweenable#resume
   * @return {Tweenable}
   */
  resume(): Tweenable {
    return this._resume()
  }

  /**
   * @private
   * @param {number} currentTime
   * @returns {Tweenable}
   */
  _resume(currentTime: number = Tweenable.now()): Tweenable {
    if (this._timestamp === null) {
      return this.tween()
    }

    if (this._isPlaying) {
      return this._promise
    }

    if (this._pausedAtTime) {
      this._timestamp += currentTime - this._pausedAtTime
      this._pausedAtTime = null
    }

    this._isPlaying = true

    if (listHead === null) {
      listHead = this
      listTail = this
    } else {
      this._previous = listTail
      listTail._next = this

      listTail = this
    }

    return this
  }

  /**
   * Move the state of the animation to a specific point in the tween's
   * timeline.  If the animation is not running, this will cause {@link
   * shifty.renderFunction} handlers to be called.
   * @method Tweenable#seek
   * @param {number} millisecond The millisecond of the animation to seek
   * to.  This must not be less than `0`.
   * @return {Tweenable}
   */
  seek(millisecond: number): Tweenable {
    millisecond = Math.max(millisecond, 0)
    const currentTime = Tweenable.now()

    if (this._timestamp + millisecond === 0) {
      return this
    }

    this._timestamp = currentTime - millisecond

    // Make sure that any render handlers are run.
    processTween(this, currentTime)

    return this
  }

  /**
   * Stops a tween. If a tween is not running, this is a no-op. This method
   * does not cancel the tween {@link external:Promise}. For that, use {@link
   * Tweenable#cancel}.
   * @param {boolean} [gotoEnd] If `false`, the tween just stops at its current
   * state.  If `true`, the tweened object's values are instantly set to the
   * target values.
   * @method Tweenable#stop
   * @return {Tweenable}
   */
  stop(gotoEnd = false): Tweenable {
    if (!this._isPlaying) {
      return this
    }

    this._isPlaying = false

    remove(this)

    const hasFilters = this._filters.length > 0

    if (gotoEnd) {
      if (hasFilters) {
        this._applyFilter(BEFORE_TWEEN)
      }

      tweenProps(
        1,
        this._currentState,
        this._originalState,
        this._targetState,
        1,
        0,
        this._easing
      )

      if (hasFilters) {
        this._applyFilter(AFTER_TWEEN)
        this._applyFilter(AFTER_TWEEN_END)
      }
    }

    if (this._resolve) {
      this._resolve({
        data: this._data,
        state: this._currentState,
        tweenable: this,
      })
    }

    this._resolve = null
    this._reject = null

    return this
  }

  /**
   * {@link Tweenable#stop}s a tween and also `reject`s its {@link
   * external:Promise}. If a tween is not running, this is a no-op. Prevents
   * calling any provided `finish` function.
   * @param {boolean} [gotoEnd] Is propagated to {@link Tweenable#stop}.
   * @method Tweenable#cancel
   * @return {Tweenable}
   * @see https://github.com/jeremyckahn/shifty/issues/122
   */
  cancel(gotoEnd = false): Tweenable {
    const { _currentState, _data, _isPlaying } = this

    if (!_isPlaying) {
      return this
    }

    if (this._reject) {
      this._reject({
        data: _data,
        state: _currentState,
        tweenable: this,
      })
    }

    this._resolve = null
    this._reject = null

    return this.stop(gotoEnd)
  }

  /**
   * Whether or not a tween is running.
   * @method Tweenable#isPlaying
   * @return {boolean}
   */
  isPlaying(): boolean {
    return this._isPlaying
  }

  /**
   * Whether or not a tween has finished running.
   * @method Tweenable#hasEnded
   * @return {boolean}
   */
  hasEnded(): boolean {
    return this._hasEnded
  }

  /**
   * @method Tweenable#setScheduleFunction
   * @param {shifty.scheduleFunction} scheduleFunction
   * @deprecated Will be removed in favor of {@link Tweenable.setScheduleFunction} in 3.0.
   */
  setScheduleFunction(scheduleFunction: shifty.scheduleFunction) {
    Tweenable.setScheduleFunction(scheduleFunction)
  }

  /**
   * Get and optionally set the data that gets passed as `data` to {@link
   * shifty.promisedData}, {@link shifty.startFunction} and {@link
   * shifty.renderFunction}.
   * @param {Object} [data]
   * @method Tweenable#data
   * @return {Object} The internally stored `data`.
   */
  data(data: object = null): object {
    if (data) {
      this._data = { ...data }
    }

    return this._data
  }

  /**
   * `delete` all "own" properties.  Call this when the {@link
   * Tweenable} instance is no longer needed to free memory.
   * @method Tweenable#dispose
   */
  dispose() {
    for (const prop in this) {
      delete this[prop]
    }
  }
}

/**
 * @method shifty.tween
 * @param {TweenableConfig} [config={}]
 * @description Standalone convenience method that functions identically to
 * {@link Tweenable#tween}.  You can use this to create tweens without
 * needing to set up a {@link Tweenable} instance.
 *
 * ```
 * import { tween } from 'shifty';
 *
 * tween({ from: { x: 0 }, to: { x: 10 } }).then(
 *   () => console.log('All done!')
 * );
 * ```
 *
 * @returns {Tweenable} A new {@link Tweenable} instance.
 */
export function tween(config: TweenableConfig = {}): Tweenable {
  const tweenable = new Tweenable()
  tweenable.tween(config)

  // This is strictly a legacy shim from when this function returned a Promise.
  // TODO: Remove this line in the next major version
  tweenable.tweenable = tweenable

  return tweenable
}

shouldScheduleUpdate(true)
