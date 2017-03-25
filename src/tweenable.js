import * as easingFunctions from './easing-functions';

// CONSTANTS
const DEFAULT_EASING = 'linear';
const DEFAULT_DURATION = 500;
const UPDATE_TIME = 1000 / 60;
const root = typeof window !== 'undefined' ? window : global;

// requestAnimationFrame() shim by Paul Irish (modified for Shifty)
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
const DEFAULT_SCHEDULE_FUNCTION = (
  root.requestAnimationFrame
  || root.webkitRequestAnimationFrame
  || root.oRequestAnimationFrame
  || root.msRequestAnimationFrame
  || (root.mozCancelRequestAnimationFrame && root.mozRequestAnimationFrame)
  || setTimeout
);

const noop = () => {};

/**
 * Handy shortcut for doing a for-in loop. This is not a "normal" each
 * function, it is optimized for Shifty.  The iterator function only receives
 * the property name, not the value.
 * @param {Object} obj
 * @param {Function(string)} fn
 * @private
 */
export const each = (obj, fn) => {
  Object.keys(obj).forEach(fn);
};

/**
 * @param {Object} obj
 * @return {Object}
 * @private
 */
export const clone = obj => Object.assign({}, obj);

/**
 * This object contains all of the tweens available to Shifty.  It is
 * extensible - simply attach properties to the `Tweenable.formulas`
 * Object following the same format as `linear`.
 *
 * `pos` should be a normalized `number` (between 0 and 1).
 * @type {Object(function)}
 * @private
 */
const formulas = clone(easingFunctions);

/**
 * Tweens a single property.
 * @param {number} start The value that the tween started from.
 * @param {number} end The value that the tween should end at.
 * @param {Function} easingFunc The easing curve to apply to the tween.
 * @param {number} position The normalized position (between 0.0 and 1.0) to
 * calculate the midpoint of 'start' and 'end' against.
 * @return {number} The tweened value.
 * @private
 */
const tweenProp = (start, end, easingFunc, position) =>
  start + (end - start) * easingFunc(position);

/**
 * Calculates the interpolated tween values of an Object for a given
 * timestamp.
 * @param {Number} forPosition The position to compute the state for.
 * @param {Object} currentState Current state properties.
 * @param {Object} originalState: The original state properties the Object is
 * tweening from.
 * @param {Object} targetState: The destination state properties the Object
 * is tweening to.
 * @param {number} duration: The length of the tween in milliseconds.
 * @param {number} timestamp: The UNIX epoch time at which the tween began.
 * @param {Object} easing: This Object's keys must correspond to the keys in
 * targetState.
 * @private
 */
export const tweenProps = (
  forPosition,
  currentState,
  originalState,
  targetState,
  duration,
  timestamp,
  easing
) => {
  const normalizedPosition = forPosition < timestamp ?
    0 :
    (forPosition - timestamp) / duration;

  each(currentState, key => {
    const easingObjectProp = easing[key];
    const easingFn = typeof easingObjectProp === 'function' ?
      easingObjectProp :
      formulas[easingObjectProp];

    currentState[key] = tweenProp(
      originalState[key],
      targetState[key],
      easingFn,
      normalizedPosition
    );
  });

  return currentState;
};


/**
 * Creates a usable easing Object from a string, a function or another easing
 * Object.  If `easing` is an Object, then this function clones it and fills
 * in the missing properties with `"linear"`.
 * @param {Object.<string|Function>} fromTweenParams
 * @param {Object|string|Function} easing
 * @return {Object.<string|Function>}
 * @private
 */
export const composeEasingObject = (fromTweenParams, easing = DEFAULT_EASING) => {
  const composedEasing = {};
  let typeofEasing = typeof easing;

  if (typeofEasing === 'string' || typeofEasing === 'function') {
    each(fromTweenParams, prop => composedEasing[prop] = easing);
  } else {
    each(fromTweenParams, prop =>
      composedEasing[prop] =
        composedEasing[prop] || easing[prop] || DEFAULT_EASING
    );
  }

  return composedEasing;
};

export class Tweenable {
  /**
   * @constructs shifty.Tweenable
   * @param {Object=} initialState The values that the initial tween should
   * start at if a `from` object is not provided to `tween` or `setConfig`.
   * @param {Object=} config Configuration object to be passed to
   * [`setConfig`]{@link shifty.Tweenable#setConfig}.
   */
  constructor (initialState = {}, config = undefined) {
    this._currentState = initialState;
    this._configured = false;
    this._scheduleFunction = DEFAULT_SCHEDULE_FUNCTION;

    // To prevent unnecessary calls to setConfig do not set default
    // configuration here.  Only set default configuration immediately before
    // tweening if none has been set.
    if (config !== undefined) {
      this.setConfig(config);
    }
  }

  /**
   * Applies a filter to Tweenable instance.
   * @param {Tweenable} tweenable The `Tweenable` instance to call the filter
   * upon.
   * @param {String} filterName The name of the filter to apply.
   * @private
   */
  _applyFilter (filterName) {
    let filters = Tweenable.filters;
    let args = this._filterArgs;

    each(filters, name => {
      let filter = filters[name][filterName];

      if (typeof filter !== 'undefined') {
        filter.apply(this, args);
      }
    });
  }

  /**
   * Handles the update logic for one step of a tween.
   * @param {number=} currentTimeOverride Needed for accurate timestamp in
   * shifty.Tweenable#seek.
   * @private
   */
  _timeoutHandler (currentTimeOverride) {
    const delay = this._delay;
    const currentState = this._currentState;
    let timestamp = this._timestamp;
    let duration = this._duration;
    let targetState = this._targetState;
    let step = this._step;

    const endTime = timestamp + delay + duration;
    let currentTime =
      Math.min(currentTimeOverride || Tweenable.now(), endTime);
    const hasEnded = currentTime >= endTime;
    const offset = duration - (endTime - currentTime);

    if (this.isPlaying()) {
      if (hasEnded) {
        step(targetState, this._attachment, offset);
        this.stop(true);
      } else {
        // This function needs to be .call-ed because it is a native method in
        // some environments:
        // http://stackoverflow.com/a/9678166
        this._scheduleId = this._scheduleFunction.call(
          root,
          () => this._timeoutHandler(...arguments),
          UPDATE_TIME
        );

        this._applyFilter('beforeTween');

        // If the animation has not yet reached the start point (e.g., there was
        // delay that has not yet completed), just interpolate the starting
        // position of the tween.
        if (currentTime < (timestamp + delay)) {
          currentTime = 1;
          duration = 1;
          timestamp = 1;
        } else {
          timestamp += delay;
        }

        tweenProps(
          currentTime,
          currentState,
          this._originalState,
          targetState,
          duration,
          timestamp,
          this._easing
        );

        this._applyFilter('afterTween');
        step(currentState, this._attachment, offset);
      }
    }
  }

  /**
   * Configure and start a tween.
   * @method shifty.Tweenable#tween
   * @param {Object=} config See `config` options for `{@link
   * shifty.Tweenable#setConfig}`
   * @return {Promise}
   */
  tween (config = undefined) {
    if (this._isTweening) {
      return this;
    }

    // Only set default config if no configuration has been set previously and
    // none is provided now.
    if (config !== undefined || !this._configured) {
      this.setConfig(config);
    }

    this._timestamp = Tweenable.now();
    this._start(this.get(), this._attachment);
    return this.resume();
  }

  /**
   * Configure a tween that will start at some point in the future.
   *
   * @method shifty.Tweenable#setConfig
   * @param {Object} config See below
   * @property {Object=} config.from Starting position.  If omitted, `{@link
   * shifty.Tweenable#get}` is used.
   * @property {Object=} config.to Ending position.
   * @property {number=} config.duration How many milliseconds to animate for.
   * @property {number=} config.delay  How many milliseconds to wait before
   * starting
   * the tween.
   * @property {Function(Object, *)=} config.start Function to execute when the
   * tween begins.  Receives the state of the tween as the first parameter and
   * `attachment` as the second parameter.
   * @property {Function(Object, *, number)=} config.step Function to execute
   * on every tick.  Receives `get` as the first parameter, `attachment` as the
   * second parameter, and the time elapsed since the start of the tween as the
   * third.  This function is not called on the final step of the animation.
   * @property {Object.<string|Function|string|Function>=} config.easing Easing
   * curve name(s) or function(s) to use for the tween.
   * @property {*=} config.attachment Cached value that is passed to the
   * `step`/`start` functions.
   * @return {Tweenable}
   */
  setConfig (config = {}) {
    this._configured = true;

    // Attach something to this Tweenable instance (e.g.: a DOM element, an
    // object, a string, etc.);
    this._attachment = config.attachment;

    // Init the internal state
    Object.assign(this, {
      _pausedAtTime: null,
      _scheduleId: null,
      _delay: config.delay || 0,
      _start: config.start || noop,
      _step: config.step || noop,
      _duration: config.duration || DEFAULT_DURATION,
      _currentState: clone(config.from || this.get()),
    });

    // Separate Object.assign here; it depends on _currentState being set above
    Object.assign(this, {
      _originalState: this.get(),
      _targetState: clone(config.to || this.get())
    });

    let currentState = this._currentState;
    // Ensure that there is always something to tween to.
    this._targetState = Object.assign({}, currentState, this._targetState);

    this._easing = composeEasingObject(currentState, config.easing);
    this._filterArgs =
      [currentState, this._originalState, this._targetState, this._easing];
    this._applyFilter('tweenCreated');

    this._promise = new Promise(
      (resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      }
    );

    // Needed to silence (harmless) logged errors when a .catch handler is not
    // added by downsteam code
    this._promise.catch(noop);

    return this;
  }

  /**
   * @method shifty.Tweenable#get
   * @return {Object} The current state.
   */
  get () {
    return clone(this._currentState);
  }

  /**
   * @method shifty.Tweenable#set
   * @param {Object} state The state to set.
   * @description Set the current state.
   */
  set (state) {
    this._currentState = state;
  }

  /**
   * Pause a tween.  Paused tweens can be resumed from the point at which they
   * were paused.  This is different from `stop`, as that method causes a tween
   * to start over when it is resumed.
   * @method shifty.Tweenable#pause
   * @return {Tweenable}
   */
  pause () {
    this._pausedAtTime = Tweenable.now();
    this._isPaused = true;

    return this;
  }

  /**
   * Resume a paused tween.
   * @method shifty.Tweenable#resume
   * @return {Promise}
   */
  resume () {
    if (this._isPaused) {
      this._timestamp += Tweenable.now() - this._pausedAtTime;
    }

    this._isPaused = false;
    this._isTweening = true;
    this._timeoutHandler();

    return this._promise;
  }

  /**
   * Move the state of the animation to a specific point in the tween's
   * timeline.  If the animation is not running, this will cause the `step`
   * handlers to be called.
   * @method shifty.Tweenable#seek
   * @param {millisecond} millisecond The millisecond of the animation to seek
   * to.  This must not be less than `0`.
   * @return {Tweenable}
   */
  seek (millisecond) {
    millisecond = Math.max(millisecond, 0);
    const currentTime = Tweenable.now();

    if ((this._timestamp + millisecond) === 0) {
      return this;
    }

    this._timestamp = currentTime - millisecond;

    if (!this.isPlaying()) {
      this._isTweening = true;
      this._isPaused = false;

      // If the animation is not running, call _timeoutHandler to make sure that
      // any step handlers are run.
      this._timeoutHandler(currentTime);

      this.pause();
    }

    return this;
  }

  /**
   * Stops and cancels a tween.
   * @param {boolean=} gotoEnd If `false` or omitted, the tween just stops at
   * its current state, and the tween promise is not resolved.  If `true`, the
   * tweened object's values are instantly set to the target values, and the
   * promise is resolved.
   * @method shifty.Tweenable#stop
   * @return {Tweenable}
   */
  stop (gotoEnd) {
    this._isTweening = false;
    this._isPaused = false;

    (
      root.cancelAnimationFrame           ||
      root.webkitCancelAnimationFrame     ||
      root.oCancelAnimationFrame          ||
      root.msCancelAnimationFrame         ||
      root.mozCancelRequestAnimationFrame ||
      root.clearTimeout
    )(this._scheduleId);

    if (gotoEnd) {
      this._applyFilter('beforeTween');
      tweenProps(
        1,
        this._currentState,
        this._originalState,
        this._targetState,
        1,
        0,
        this._easing
      );
      this._applyFilter('afterTween');
      this._applyFilter('afterTweenEnd');
      this._resolve(this._currentState, this._attachment);
    } else {
      this._reject(this._currentState, this._attachment);
    }

    return this;
  }

  /**
   * Whether or not a tween is running.
   * @method shifty.Tweenable#isPlaying
   * @return {boolean}
   */
  isPlaying () {
    return this._isTweening && !this._isPaused;
  }

  /**
   * Set a custom schedule function.
   *
   * If a custom function is not set,
   * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
   * is used if available, otherwise
   * [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window.setTimeout)
   * is used.
   * @method shifty.Tweenable#setScheduleFunction
   * @param {Function(Function,number)} scheduleFunction The function to be
   * used to schedule the next frame to be rendered.
   */
  setScheduleFunction (scheduleFunction) {
    this._scheduleFunction = scheduleFunction;
  }

  /**
   * `delete` all "own" properties.  Call this when the `Tweenable` instance
   * is no longer needed to free memory.
   * @method shifty.Tweenable#dispose
   */
  dispose () {
    each(this, prop => delete this[prop]);
  }
}

Object.assign(Tweenable, {
  /**
   * @memberof shifty.Tweenable
   * @type {Object.<Function(number)>}
   * @static
   * @description A static Object of easing functions that can by used by
   * Shifty.
   */
  formulas,
  filters: {},

  /**
   * @memberof shifty.Tweenable
   * @function
   * @static
   * @description Returns the current timestamp
   * @returns {number}
   */
  now: (Date.now || (_ => +new Date()))
});

/**
 * @method shifty.tween
 * @param {Object=} config See `config` options for `{@link
 * shifty.Tweenable#setConfig}`
 * @description Standalone convenience method that functions identically to
 * [`shifty.Tweenable#tween`]{@link shifty.Tweenable#tween}.  You can use this to create
 * tweens without needing to set up a `{@link shifty.Tweenable}` instance.
 *
 *     import { tween } from 'shifty';
 *
 *     tween({ from: { x: 0 }, to: { x: 10 } }).then(
 *       () => console.log('All done!')
 *     );
 *
 * @returns {Promise}
 */
export function tween (config = {}) {
  const tweenable = new Tweenable();
  const promise = tweenable.tween(config);
  promise.tweenable = tweenable;

  return promise;
}
