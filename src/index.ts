import {
  processTweens,
  shouldScheduleUpdate,
  Tweenable,
  tween,
} from './tweenable'

export { processTweens, shouldScheduleUpdate, Tweenable, tween }
export { interpolate } from './interpolate'
export { Scene } from './scene'
export { setBezierFunction } from './bezier'
export { standardEasingFunctions } from './standard-easing-functions'

export * from './types'

/**
 * The NPM package version of Shifty.
 */
export const VERSION = String(process.env.npm_package_version)
