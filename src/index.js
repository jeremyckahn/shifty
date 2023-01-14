/**
 * @namespace shifty
 */

import {
  processTweens,
  shouldScheduleUpdate,
  Tweenable,
  tween,
} from './tweenable'
import * as token from './token'

Tweenable.filters.token = token

export { processTweens, shouldScheduleUpdate, Tweenable, tween }
export { interpolate } from './interpolate'
export { Scene } from './scene'
export { setBezierFunction, unsetBezierFunction } from './bezier'

/**
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

/**
 * @external thenable
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then}
 */

/**
 * @callback shifty.easingFunction
 * @param {number} position The normalized (0-1) position of the tween.
 * @return {number} The curve-adjusted value.
 */

/**
 * @callback shifty.startFunction
 * @param {Object} state The current state of the tween.
 * @param {Object|undefined} [data] User-defined data provided via a {@link
 * shifty.tweenConfig}.
 * @returns {void}
 */

/**
 * @callback shifty.finishFunction
 * @param {shifty.promisedData} promisedData
 * @returns {void}
 */

/**
 * Gets called for every tick of the tween.  This function is not called on the
 * final tick of the animation.
 * @callback shifty.renderFunction
 * @param {Object} state The current state of the tween.
 * @param {Object|undefined} data User-defined data provided via a {@link
 * shifty.tweenConfig}.
 * @param {number} timeElapsed The time elapsed since the start of the tween.
 * @returns {void}
 */

/**
 * @callback shifty.scheduleFunction
 * @param {Function} callback
 * @param {number} timeout
 * @returns {void}
 */

/**
 * @typedef {Object} shifty.tweenConfig
 * @property {Object} [from] Starting position.  If omitted, {@link
 * Tweenable#get} is used.
 * @property {Object} [to] Ending position.  The keys of this Object should
 * match those of `to`.
 * @property {number} [duration] How many milliseconds to animate for.
 * @property {number} [delay] How many milliseconds to wait before starting the
 * tween.
 * @property {shifty.startFunction} [start] Executes when the tween begins.
 * @property {shifty.finishFunction} [finish] Executes when the tween
 * completes. This will get overridden by {@link Tweenable#then} if that
 * is called, and it will not fire if {@link Tweenable#cancel} is
 * called.
 * @property {shifty.renderFunction} [render] Executes on every tick. Shifty
 * assumes a [retained mode](https://en.wikipedia.org/wiki/Retained_mode)
 * rendering environment, which in practice means that `render` only gets
 * called when the tween state changes. Importantly, this means that `render`
 * is _not_ called when a tween is not animating (for instance, when it is
 * paused or waiting to start via the `delay` option). This works naturally
 * with DOM environments, but you may need to account for this design in more
 * custom environments such as `<canvas>`.
 *
 * Legacy property name: `step`.
 * @property {string|shifty.easingFunction|Object<string|shifty.easingFunction>|Array.<number>} [easing]
 * - `string`: Name of the {@link Tweenable.formulas} to apply to all
 *   properties of the tween.
 * - {@link shifty.easingFunction}: A custom function that computes the rendered
 *   position of the tween for the given normalized position of the tween.
 * - `Object`: Keys are tween property names. Values are the {@link
 *   Tweenable.formulas} to be applied to each tween property, or a {@link
 *   shifty.easingFunction}. Any tween properties not included in the `Object`
 *   default to `'linear'`.
 * - `Array.<number>`: The array must contain four `number` values that
 *   correspond to the `[x1, y1, x2, y2]` values of a [Bezier
 * curve](https://cubic-bezier.com/).
 *
 * You can learn more about this in the {@tutorial
 * easing-function-in-depth} tutorial.
 * @property {Object} [data] Data that is passed to {@link
 * shifty.startFunction}, {@link shifty.renderFunction}, and {@link
 * shifty.promisedData}. Legacy property name: `attachment`.
 * @property {Function} [promise] Promise constructor for when you want
 * to use Promise library or polyfill Promises in unsupported environments.
 */

/**
 * @typedef {Object} shifty.promisedData
 * @property {Object} state The current state of the tween.
 * @property {Object} data The `data` Object that the tween was configured with.
 * @property {Tweenable} tweenable The {@link Tweenable} instance to
 * which the tween belonged.
 */

/**
 * Is called when a tween is created to determine if a filter is needed.
 * Filters are only added to a tween when it is created so that they are not
 * unnecessarily processed if they don't apply during an update tick.
 * @callback shifty.doesApplyFilter
 * @param {Tweenable} tweenable The {@link Tweenable} instance.
 * @return {boolean}
 */

/**
 * Is called when a tween is created.  This should perform any setup needed by
 * subsequent per-tick calls to {@link shifty.beforeTween} and {@link
 * shifty.afterTween}.
 * @callback shifty.tweenCreatedFilter
 * @param {Tweenable} tweenable The {@link Tweenable} instance.
 * @returns {void}
 */

/**
 * Is called right before a tween is processed in a tick.
 * @callback shifty.beforeTweenFilter
 * @param {Tweenable} tweenable The {@link Tweenable} instance.
 * @returns {void}
 */

/**
 * Is called right after a tween is processed in a tick.
 * @callback shifty.afterTweenFilter
 * @param {Tweenable} tweenable The {@link Tweenable} instance.
 * @returns {void}
 */

/**
 * An Object that contains functions that are called at key points in a tween's
 * lifecycle.  Shifty can only process `Number`s internally, but filters can
 * expand support for any type of data.  This is the mechanism that powers
 * [string interpolation]{@tutorial string-interpolation}.
 * @typedef {Object} shifty.filter
 * @property {shifty.doesApplyFilter} doesApply Is called when a tween is
 * created.
 * @property {shifty.tweenCreatedFilter} tweenCreated Is called when a tween is
 * created.
 * @property {shifty.beforeTweenFilter} beforeTween Is called right before a
 * tween starts.
 * @property {shifty.afterTweenFilter} afterTween Is called right after a tween
 * ends.
 */
