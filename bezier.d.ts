import { EasingFunction } from './types';
/**
 * Generates a transition easing function that is compatible with WebKit's CSS
 * transitions `-webkit-transition-timing-function` CSS property.
 *
 * The W3C has more information about CSS3 transition timing functions:
 * http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
export declare const getCubicBezierTransition: (x1?: number, y1?: number, x2?: number, y2?: number) => EasingFunction;
/**
 * Create a Bezier easing function and attach it to {@link
 * Tweenable.easing}.  This function gives you total control over the
 * easing curve.  Matthew Lein's [Ceaser](http://matthewlein.com/ceaser/) is a
 * useful tool for visualizing the curves you can make with this function.
 *
 * To remove any easing functions that are created by this method, `delete`
 * them from {@link Tweenable.easing}:
 *
 * ```
 * setBezierFunction('customCurve', 0, 0, 1, 1)
 *
 * delete Tweenable.easing.customCurve
 * ```
 * @return {EasingFunction} The {@link EasingFunction} that was
 * attached to {@link Tweenable.easing}.
 */
export declare const setBezierFunction: (name: string, x1: number, y1: number, x2: number, y2: number) => EasingFunction;
