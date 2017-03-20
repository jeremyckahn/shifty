import {
  Tweenable,
  tween
} from './tweenable';

import { interpolate } from './interpolate';
import { setBezierFunction, unsetBezierFunction } from './bezier';
import * as token from './token';

Tweenable.filters.token = token;

/**
 * @namespace shifty
 */
export {
  Tweenable,
  tween,
  interpolate,
  setBezierFunction,
  unsetBezierFunction
};
