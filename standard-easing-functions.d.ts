/*!
 * All equations are adapted from Thomas Fuchs'
 * [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js).
 *
 * Based on Easing Equations (c) 2003 [Robert
 * Penner](http://www.robertpenner.com/), all rights reserved. This work is
 * [subject to terms](http://www.robertpenner.com/easing_terms_of_use.html).
 */
/*!
 *  TERMS OF USE - EASING EQUATIONS
 *  Open source under the BSD License.
 *  Easing Equations (c) 2003 Robert Penner, all rights reserved.
 */
/**
 * The standard set of easing functions availble for use with Shifty tweens.
 *
 * This is distinct from `Tweenable`'s {@link Tweenable.easing}. {@link
 * Tweenable.easing} contains everything within `easingFunctions` but also any
 * custom easing functions that you have defined.
 */
export declare const standardEasingFunctions: Readonly<{
    linear: (pos: number) => number;
    easeInQuad: (pos: number) => number;
    easeOutQuad: (pos: number) => number;
    easeInOutQuad: (pos: number) => number;
    easeInCubic: (pos: number) => number;
    easeOutCubic: (pos: number) => number;
    easeInOutCubic: (pos: number) => number;
    easeInQuart: (pos: number) => number;
    easeOutQuart: (pos: number) => number;
    easeInOutQuart: (pos: number) => number;
    easeInQuint: (pos: number) => number;
    easeOutQuint: (pos: number) => number;
    easeInOutQuint: (pos: number) => number;
    easeInSine: (pos: number) => number;
    easeOutSine: (pos: number) => number;
    easeInOutSine: (pos: number) => number;
    easeInExpo: (pos: number) => number;
    easeOutExpo: (pos: number) => number;
    easeInOutExpo: (pos: number) => number;
    easeInCirc: (pos: number) => number;
    easeOutCirc: (pos: number) => number;
    easeInOutCirc: (pos: number) => number;
    easeOutBounce: (pos: number) => number;
    easeInBack: (pos: number) => number;
    easeOutBack: (pos: number) => number;
    easeInOutBack: (pos: number) => number;
    elastic: (pos: number) => number;
    swingFromTo: (pos: number) => number;
    swingFrom: (pos: number) => number;
    swingTo: (pos: number) => number;
    bounce: (pos: number) => number;
    bouncePast: (pos: number) => number;
    easeFromTo: (pos: number) => number;
    easeFrom: (pos: number) => number;
    easeTo: (pos: number) => number;
}>;
