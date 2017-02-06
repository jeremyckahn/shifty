import { Tweenable, shallowCopy } from './shifty.core';
import { interpolate } from './shifty.interpolate';
import formulas from './shifty.formulas';

shallowCopy(Tweenable.prototype.formula, formulas);

export default { Tweenable, interpolate };
