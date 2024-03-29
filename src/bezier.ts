import { Tweenable } from './tweenable'

import { EasingFunction, EasingKey } from './types'

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

/* istanbul ignore next */
function cubicBezierAtTime(
  t: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  duration: number
): number {
  let ax = 0,
    bx = 0,
    cx = 0,
    ay = 0,
    by = 0,
    cy = 0

  const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t

  const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t

  const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  const solveEpsilon = (duration: number) => 1 / (200 * duration)

  const fabs = (n: number) => (n >= 0 ? n : 0 - n)

  const solveCurveX = (x: number, epsilon: number) => {
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

  const solve = (x: number, epsilon: number) =>
    sampleCurveY(solveCurveX(x, epsilon))

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
 * Generates a transition easing function that is compatible with WebKit's CSS
 * transitions `-webkit-transition-timing-function` CSS property.
 *
 * The W3C has more information about CSS3 transition timing functions:
 * http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
export const getCubicBezierTransition = (
  x1 = 0.25,
  y1 = 0.25,
  x2 = 0.75,
  y2 = 0.75
): EasingFunction => pos => cubicBezierAtTime(pos, x1, y1, x2, y2, 1)

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
export const setBezierFunction = (
  /**
   * The name of the easing curve. Overwrites the matching, preexisting easing
   * function on {@link Tweenable.easing} if it exists.
   */
  name: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): EasingFunction => {
  const cubicBezierTransition = getCubicBezierTransition(x1, y1, x2, y2)

  cubicBezierTransition.displayName = name
  cubicBezierTransition.x1 = x1
  cubicBezierTransition.y1 = y1
  cubicBezierTransition.x2 = x2
  cubicBezierTransition.y2 = y2

  return (Tweenable.easing[name as EasingKey] = cubicBezierTransition)
}
