/**
 * @namespace shifty
 */

export { Tweenable, tween } from './tweenable';
export { interpolate } from './interpolate';
export { setBezierFunction, unsetBezierFunction } from './bezier';

/**
 * @callback {Function} shifty.startFunction
 * @param {Object} state The current state of the tween.
 * @param {Object} [attachment] Cached data provided from a {@link
 * shifty.tweenConfig}.
 */

/**
 * Gets called for every tick of the tween.  This function is not called on the
 * final step of the animation.
 * @callback {Function} shifty.stepFunction
 * @param {Object} state The current state of the tween.
 * @param {Object|undefined} attachment Cached data provided from a {@link
 * shifty.tweenConfig}.
 * @param {number} timeElapsed The time elapsed since the start of the tween.
 */

/**
 * @typedef {Object} shifty.tweenConfig
 * @property {Object} [from] Starting position.  If omitted, {@link
 * shifty.Tweenable#get} is used.
 * @property {Object} [to] Ending position.
 * @property {number} [duration] How many milliseconds to animate for.
 * @property {number} [delay] How many milliseconds to wait before starting the
 * tween.
 * @property {shifty.startFunction} [start] Executes when the tween begins.
 * @property {shifty.stepFunction} [step] Executes on every tick.
 * @property {Object.<string|Function>|string|Function} [easing] Easing curve
 * name(s) or function(s) to use for the tween.
 * @property {Object} [attachment] Cached value that is passed to {@link
 * shifty.startFunction}/{@link shifty.stepFunction}.
 * @property {Function} [promise] Promise constructor for when you want
 * to use Promise library or polyfill Promises in unsupported environments.
 */
