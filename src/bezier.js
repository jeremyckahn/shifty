import { Tweenable } from './tweenable'
/** @typedef {import(".").shifty.easingFunction} shifty.easingFunction */

/**
 * The Bezier magic in this file is adapted/copied almost wholesale from
 * [Scripty2](https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/cubic-bezier.js),
 * which was adapted from Apple code (which probably came from
 * [here](http://opensource.apple.com/source/WebCore/WebCore-955.66/platform/graphics/UnitBezier.h)).
 * Special thanks to Apple and Thomas Fuchs for much of this code.
 */

/**
 *  Copyright (c) 2006 Apple Computer, Inc. All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice,
 *  this list of conditions and the following disclaimer.
 *
 *  2. Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation
 *  and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder(s) nor the names of any
 *  contributors may be used to endorse or promote products derived from
 *  this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 *  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 *  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 *  SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 *  CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
// port of webkit cubic bezier handling by http://www.netzgesta.de/dev/

/**
 * @param {number} t
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} duration
 * @returns {Function}
 * @private
 */
function cubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
  let ax = 0,
    bx = 0,
    cx = 0,
    ay = 0,
    by = 0,
    cy = 0

  const sampleCurveX = t => ((ax * t + bx) * t + cx) * t

  const sampleCurveY = t => ((ay * t + by) * t + cy) * t

  const sampleCurveDerivativeX = t => (3 * ax * t + 2 * bx) * t + cx

  const solveEpsilon = duration => 1 / (200 * duration)

  const fabs = n => (n >= 0 ? n : 0 - n)

  const solveCurveX = (x, epsilon) => {
    let t0, t1, t2, x2, d2, i

    for (t2 = x, i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x

      if (fabs(x2) < epsilon) {
        return t2
      }

      d2 = sampleCurveDerivativeX(t2)

      if (fabs(d2) < 1e-6) {
        break
      }

      t2 = t2 - x2 / d2
    }

    t0 = 0
    t1 = 1
    t2 = x

    if (t2 < t0) {
      return t0
    }

    if (t2 > t1) {
      return t1
    }

    while (t0 < t1) {
      x2 = sampleCurveX(t2)

      if (fabs(x2 - x) < epsilon) {
        return t2
      }

      if (x > x2) {
        t0 = t2
      } else {
        t1 = t2
      }

      t2 = (t1 - t0) * 0.5 + t0
    }

    return t2 // Failure.
  }

  const solve = (x, epsilon) => sampleCurveY(solveCurveX(x, epsilon))

  cx = 3 * p1x
  bx = 3 * (p2x - p1x) - cx
  ax = 1 - cx - bx
  cy = 3 * p1y
  by = 3 * (p2y - p1y) - cy
  ay = 1 - cy - by

  return solve(t, solveEpsilon(duration))
}
// End ported code

/**
 *  GetCubicBezierTransition(x1, y1, x2, y2) -> Function.
 *
 *  Generates a transition easing function that is compatible
 *  with WebKit's CSS transitions `-webkit-transition-timing-function`
 *  CSS property.
 *
 *  The W3C has more information about CSS3 transition timing functions:
 *  http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 *
 *  @param {number} [x1]
 *  @param {number} [y1]
 *  @param {number} [x2]
 *  @param {number} [y2]
 *  @return {Function}
 */
export const getCubicBezierTransition = (
  x1 = 0.25,
  y1 = 0.25,
  x2 = 0.75,
  y2 = 0.75
) => pos => cubicBezierAtTime(pos, x1, y1, x2, y2, 1)

/**
 * Create a Bezier easing function and attach it to {@link
 * Tweenable.formulas}.  This function gives you total control over the
 * easing curve.  Matthew Lein's [Ceaser](http://matthewlein.com/ceaser/) is a
 * useful tool for visualizing the curves you can make with this function.
 * @method shifty.setBezierFunction
 * @param {string} name The name of the easing curve.  Overwrites the old
 * easing function on {@link Tweenable.formulas} if it exists.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {shifty.easingFunction} The {@link shifty.easingFunction} that was
 * attached to {@link Tweenable.formulas}.
 */
export const setBezierFunction = (name, x1, y1, x2, y2) => {
  const cubicBezierTransition = getCubicBezierTransition(x1, y1, x2, y2)

  cubicBezierTransition.displayName = name
  cubicBezierTransition.x1 = x1
  cubicBezierTransition.y1 = y1
  cubicBezierTransition.x2 = x2
  cubicBezierTransition.y2 = y2

  return (Tweenable.formulas[name] = cubicBezierTransition)
}

/**
 * `delete` an easing function from {@link Tweenable.formulas}.  Be
 * careful with this method, as it `delete`s whatever easing formula matches
 * `name` (which means you can delete standard Shifty easing functions).
 * @method shifty.unsetBezierFunction
 * @param {string} name The name of the easing function to delete.
 * @return {boolean} Whether or not the functions was `delete`d.
 */
export const unsetBezierFunction = name => delete Tweenable.formulas[name]
