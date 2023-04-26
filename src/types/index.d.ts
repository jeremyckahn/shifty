export {};

declare global {
  interface Window {
    webkitRequestAnimationFrame?: typeof requestAnimationFrame
    oRequestAnimationFrame?: typeof requestAnimationFrame
    msRequestAnimationFrame?: typeof requestAnimationFrame
    msRequestAnimationFrame?: typeof requestAnimationFrame
    mozRequestAnimationFrame?: typeof requestAnimationFrame
    mozCancelRequestAnimationFrame?: typeof cancelAnimationFrame
  }
}
