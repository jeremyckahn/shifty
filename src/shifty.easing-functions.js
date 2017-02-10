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
export function linear (pos) {
  return pos;
}

export function easeInQuad (pos) {
  return Math.pow(pos, 2);
}

export function easeOutQuad (pos) {
  return -(Math.pow((pos - 1), 2) - 1);
}

export function easeInOutQuad (pos) {
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,2);}
  return -0.5 * ((pos -= 2) * pos - 2);
}

export function easeInCubic (pos) {
  return Math.pow(pos, 3);
}

export function easeOutCubic (pos) {
  return (Math.pow((pos - 1), 3) + 1);
}

export function easeInOutCubic (pos) {
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,3);}
  return 0.5 * (Math.pow((pos - 2),3) + 2);
}

export function easeInQuart (pos) {
  return Math.pow(pos, 4);
}

export function easeOutQuart (pos) {
  return -(Math.pow((pos - 1), 4) - 1);
}

export function easeInOutQuart (pos) {
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,4);}
  return -0.5 * ((pos -= 2) * Math.pow(pos,3) - 2);
}

export function easeInQuint (pos) {
  return Math.pow(pos, 5);
}

export function easeOutQuint (pos) {
  return (Math.pow((pos - 1), 5) + 1);
}

export function easeInOutQuint (pos) {
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,5);}
  return 0.5 * (Math.pow((pos - 2),5) + 2);
}

export function easeInSine (pos) {
  return -Math.cos(pos * (Math.PI / 2)) + 1;
}

export function easeOutSine (pos) {
  return Math.sin(pos * (Math.PI / 2));
}

export function easeInOutSine (pos) {
  return (-0.5 * (Math.cos(Math.PI * pos) - 1));
}

export function easeInExpo (pos) {
  return (pos === 0) ? 0 : Math.pow(2, 10 * (pos - 1));
}

export function easeOutExpo (pos) {
  return (pos === 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
}

export function easeInOutExpo (pos) {
  if (pos === 0) {return 0;}
  if (pos === 1) {return 1;}
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(2,10 * (pos - 1));}
  return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
}

export function easeInCirc (pos) {
  return -(Math.sqrt(1 - (pos * pos)) - 1);
}

export function easeOutCirc (pos) {
  return Math.sqrt(1 - Math.pow((pos - 1), 2));
}

export function easeInOutCirc (pos) {
  if ((pos /= 0.5) < 1) {return -0.5 * (Math.sqrt(1 - pos * pos) - 1);}
  return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
}

export function easeOutBounce (pos) {
  if ((pos) < (1 / 2.75)) {
    return (7.5625 * pos * pos);
  } else if (pos < (2 / 2.75)) {
    return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
  } else if (pos < (2.5 / 2.75)) {
    return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
  } else {
    return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
  }
}

export function easeInBack (pos) {
  var s = 1.70158;
  return (pos) * pos * ((s + 1) * pos - s);
}

export function easeOutBack (pos) {
  var s = 1.70158;
  return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
}

export function easeInOutBack (pos) {
  var s = 1.70158;
  if ((pos /= 0.5) < 1) {
    return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
  }
  return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
}

export function elastic (pos) {
  return -1 * Math.pow(4,-8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
}

export function swingFromTo (pos) {
  var s = 1.70158;
  return ((pos /= 0.5) < 1) ?
      0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
      0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
}

export function swingFrom (pos) {
  var s = 1.70158;
  return pos * pos * ((s + 1) * pos - s);
}

export function swingTo (pos) {
  var s = 1.70158;
  return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
}

export function bounce (pos) {
  if (pos < (1 / 2.75)) {
    return (7.5625 * pos * pos);
  } else if (pos < (2 / 2.75)) {
    return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
  } else if (pos < (2.5 / 2.75)) {
    return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
  } else {
    return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
  }
}

export function bouncePast (pos) {
  if (pos < (1 / 2.75)) {
    return (7.5625 * pos * pos);
  } else if (pos < (2 / 2.75)) {
    return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
  } else if (pos < (2.5 / 2.75)) {
    return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
  } else {
    return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
  }
}

export function easeFromTo (pos) {
  if ((pos /= 0.5) < 1) {return 0.5 * Math.pow(pos,4);}
  return -0.5 * ((pos -= 2) * Math.pow(pos,3) - 2);
}

export function easeFrom (pos) {
  return Math.pow(pos,4);
}

export function easeTo (pos) {
  return Math.pow(pos,0.25);
}
