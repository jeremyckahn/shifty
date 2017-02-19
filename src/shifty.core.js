import * as easingFunctions from './shifty.easing-functions';
import * as token from './shifty.token';

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
 */
export const clone = obj => Object.assign({}, obj);

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
    let easingObjectProp = easing[key];
    let easingFn = typeof easingObjectProp === 'function' ?
      easingObjectProp :
      Tweenable.formulas[easingObjectProp];

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
 * Applies a filter to Tweenable instance.
 * @param {Tweenable} tweenable The `Tweenable` instance to call the filter
 * upon.
 * @param {String} filterName The name of the filter to apply.
 * @private
 */
const applyFilter = (tweenable, filterName) => {
  let filters = Tweenable.filters;
  let args = tweenable._filterArgs;

  each(filters, function (name) {
    let filter = filters[name][filterName];

    if (typeof filter !== 'undefined') {
      filter.apply(tweenable, args);
    }
  });
};

/**
 * Handles the update logic for one step of a tween.
 * @param {Tweenable} tweenable
 * @param {number} timestamp
 * @param {number} delay
 * @param {number} duration
 * @param {Object} currentState
 * @param {Object} originalState
 * @param {Object} targetState
 * @param {Object} easing
 * @param {Function(Object, *, number)} step
 * @param {Function(Function,number)}} schedule
 * @param {number=} opt_currentTimeOverride Needed for accurate timestamp in
 * Tweenable#seek.
 * @private
 */
const _timeoutHandler = (
  tweenable,
  timestamp,
  delay,
  duration,
  currentState,
  originalState,
  targetState,
  easing,
  step,
  schedule,
  opt_currentTimeOverride
) => {

  let endTime = timestamp + delay + duration;
  let currentTime =
    Math.min(opt_currentTimeOverride || Tweenable.now(), endTime);
  let isEnded = currentTime >= endTime;
  let offset = duration - (endTime - currentTime);

  if (tweenable.isPlaying()) {
    if (isEnded) {
      step(targetState, tweenable._attachment, offset);
      tweenable.stop(true);
    } else {
      tweenable._scheduleId = schedule(tweenable._timeoutHandler, UPDATE_TIME);
      applyFilter(tweenable, 'beforeTween');

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
        originalState,
        targetState,
        duration,
        timestamp,
        easing
      );

      applyFilter(tweenable, 'afterTween');
      step(currentState, tweenable._attachment, offset);
    }
  }
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
const composeEasingObject = (fromTweenParams, easing = DEFAULT_EASING) => {
  let composedEasing = {};
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
   * @class Tweenable
   * @param {Object=} opt_initialState The values that the initial tween should
   * start at if a `from` object is not provided to `{{#crossLink
   * "Tweenable/tween:method"}}{{/crossLink}}` or `{{#crossLink
   * "Tweenable/setConfig:method"}}{{/crossLink}}`.
   * @param {Object=} opt_config Configuration object to be passed to
   * `{{#crossLink "Tweenable/setConfig:method"}}{{/crossLink}}`.
   * @module Tweenable
   * @constructor
   */
  constructor (opt_initialState, opt_config) {
    this._currentState = opt_initialState || {};
    this._configured = false;
    this._scheduleFunction = DEFAULT_SCHEDULE_FUNCTION;

    // To prevent unnecessary calls to setConfig do not set default
    // configuration here.  Only set default configuration immediately before
    // tweening if none has been set.
    if (typeof opt_config !== 'undefined') {
      this.setConfig(opt_config);
    }
  }

  /**
   * Configure and start a tween.
   * @method tween
   * @param {Object=} opt_config Configuration object to be passed to
   * `{{#crossLink "Tweenable/setConfig:method"}}{{/crossLink}}`.
   * @chainable
   */
  tween (opt_config) {
    if (this._isTweening) {
      return this;
    }

    // Only set default config if no configuration has been set previously and
    // none is provided now.
    if (opt_config !== undefined || !this._configured) {
      this.setConfig(opt_config);
    }

    this._timestamp = Tweenable.now();
    this._start(this.get(), this._attachment);
    return this.resume();
  }

  /**
   * Configure a tween that will start at some point in the future.
   *
   * @method setConfig
   * @param {Object} config The following values are valid:
   * - __from__ (_Object=_): Starting position.  If omitted, `{{#crossLink
   *   "Tweenable/get:method"}}get(){{/crossLink}}` is used.
   * - __to__ (_Object=_): Ending position.
   * - __duration__ (_number=_): How many milliseconds to animate for.
   * - __delay__ (_delay=_): How many milliseconds to wait before starting the
   *   tween.
   * - __start__ (_Function(Object, *)_): Function to execute when the tween
   *   begins.  Receives the state of the tween as the first parameter and
   *   `attachment` as the second parameter.
   * - __step__ (_Function(Object, *, number)_): Function to execute on every
   *   tick.  Receives `{{#crossLink
   *   "Tweenable/get:method"}}get(){{/crossLink}}` as the first parameter,
   *   `attachment` as the second parameter, and the time elapsed since the
   *   start of the tween as the third. This function is not called on the
   *   final step of the animation, but `finish` is.
   * - __finish__ (_Function(Object, *)_): Function to execute upon tween
   *   completion.  Receives the state of the tween as the first parameter and
   *   `attachment` as the second parameter.
   * - __easing__ (_Object.<string|Function>|string|Function=_): Easing curve
   *   name(s) or function(s) to use for the tween.
   * - __attachment__ (_*_): Cached value that is passed to the
   *   `step`/`start`/`finish` methods.
   * @chainable
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
      _finish: config.finish || noop,
      _duration: config.duration || DEFAULT_DURATION,
      _currentState: clone(config.from || this.get()),
    });

    // Separate Object.assign here; it depends on _currentState being set above
    Object.assign(this, {
      _originalState: this.get(),
      _targetState: clone(config.to || this.get())
    });

    this._timeoutHandler = () => {
      Tweenable._timeoutHandler(
        this,
        this._timestamp,
        this._delay,
        this._duration,
        this._currentState,
        this._originalState,
        this._targetState,
        this._easing,
        this._step,
        this._scheduleFunction
      );
    };

    let currentState = this._currentState;
    // Ensure that there is always something to tween to.
    this._targetState = Object.assign({}, currentState, this._targetState);

    this._easing = composeEasingObject(currentState, config.easing);
    this._filterArgs =
      [currentState, this._originalState, this._targetState, this._easing];
    applyFilter(this, 'tweenCreated');

    return this;
  }

  /**
   * @method get
   * @return {Object} The current state.
   */
  get () {
    return clone(this._currentState);
  }

  /**
   * @method set
   * @param {Object} state The current state.
   */
  set (state) {
    this._currentState = state;
  }

  /**
   * Pause a tween.  Paused tweens can be resumed from the point at which they
   * were paused.  This is different from `{{#crossLink
   * "Tweenable/stop:method"}}{{/crossLink}}`, as that method
   * causes a tween to start over when it is resumed.
   * @method pause
   * @chainable
   */
  pause () {
    this._pausedAtTime = Tweenable.now();
    this._isPaused = true;

    return this;
  }

  /**
   * Resume a paused tween.
   * @method resume
   * @chainable
   */
  resume () {
    if (this._isPaused) {
      this._timestamp += Tweenable.now() - this._pausedAtTime;
    }

    this._isPaused = false;
    this._isTweening = true;
    this._timeoutHandler();

    return this;
  }

  /**
   * Move the state of the animation to a specific point in the tween's
   * timeline.  If the animation is not running, this will cause the `step`
   * handlers to be called.
   * @method seek
   * @param {millisecond} millisecond The millisecond of the animation to seek
   * to.  This must not be less than `0`.
   * @chainable
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
      Tweenable._timeoutHandler(
        this,
        this._timestamp,
        this._delay,
        this._duration,
        this._currentState,
        this._originalState,
        this._targetState,
        this._easing,
        this._step,
        this._scheduleFunction,
        currentTime
      );

      this.pause();
    }

    return this;
  }

  /**
   * Stops and cancels a tween.
   * @param {boolean=} gotoEnd If `false` or omitted, the tween just stops at
   * its current state, and the `finish` handler is not invoked.  If `true`,
   * the tweened object's values are instantly set to the target values, and
   * `finish` is invoked.
   * @method stop
   * @chainable
   */
  stop (gotoEnd) {
    this._isTweening = false;
    this._isPaused = false;
    this._timeoutHandler = noop;

    (
      root.cancelAnimationFrame           ||
      root.webkitCancelAnimationFrame     ||
      root.oCancelAnimationFrame          ||
      root.msCancelAnimationFrame         ||
      root.mozCancelRequestAnimationFrame ||
      root.clearTimeout
    )(this._scheduleId);

    if (gotoEnd) {
      applyFilter(this, 'beforeTween');
      tweenProps(
        1,
        this._currentState,
        this._originalState,
        this._targetState,
        1,
        0,
        this._easing
      );
      applyFilter(this, 'afterTween');
      applyFilter(this, 'afterTweenEnd');
      this._finish.call(this, this._currentState, this._attachment);
    }

    return this;
  }

  /**
   * @method isPlaying
   * @return {boolean} Whether or not a tween is running.
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
   * @method setScheduleFunction
   * @param {Function(Function,number)} scheduleFunction The function to be
   * used to schedule the next frame to be rendered.
   */
  setScheduleFunction (scheduleFunction) {
    this._scheduleFunction = scheduleFunction;
  }

  /**
   * `delete` all "own" properties.  Call this when the `Tweenable` instance
   * is no longer needed to free memory.
   * @method dispose
   */
  dispose () {
    each(this, prop => delete this[prop]);
  }
}

Tweenable._timeoutHandler = _timeoutHandler;
Tweenable.now = (Date.now || (_ => +new Date()));

/**
 * Filters are used for transforming the properties of a tween at various
 * points in a Tweenable's life cycle.  See the README for more info on this.
 * @private
 */
Tweenable.filters = { token };

/**
 * This object contains all of the tweens available to Shifty.  It is
 * extensible - simply attach properties to the `Tweenable.formulas`
 * Object following the same format as `linear`.
 *
 * `pos` should be a normalized `number` (between 0 and 1).
 * @property formulas
 * @type {Object(function)}
 */
Tweenable.formulas = clone(easingFunctions);

Object.assign(Tweenable, {
  tweenProps,
  applyFilter,
  composeEasingObject
});
