import { Tweenable, shallowCopy } from './shifty.core';
import { interpolate } from './shifty.interpolate';
import { setBezierFunction, unsetBezierFunction } from './shifty.bezier';
import formulas from './shifty.formulas';

shallowCopy(Tweenable.prototype.formula, formulas);

export default {
  Tweenable,
  interpolate,
  setBezierFunction,
  unsetBezierFunction
};
