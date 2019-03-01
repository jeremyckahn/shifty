export class Scene {
  #tweenables;

  /**
   * @param {...Tweenable} tweenables
   */
  constructor(...tweenables) {
    this.#tweenables = tweenables;
  }

  /**
   * @return {Array.<Tweenable>} A copy of the internal Tweenables array.
   */
  get tweenables() {
    return [...this.#tweenables];
  }

  /**
   * @param {Tweenable} tweenable
   * @return {Tweenable}
   */
  addTweenable(tweenable) {
    this.#tweenables.push(tweenable);

    return tweenable;
  }

  /**
   * @param {Tweenable} tweenable
   * @return {Tweenable}
   */
  removeTweenable(tweenable) {
    const index = this.#tweenables.indexOf(tweenable);

    if (~index) {
      this.#tweenables.splice(index, 1);
    }

    return tweenable;
  }

  /**
   * Is `true` if any {@link shifty.Tweenable} in this {@link shifty.Scene} is
   * playing.
   * @return {boolean}
   */
  isPlaying() {
    return this.#tweenables.some(tweenable => tweenable.isPlaying());
  }

  /**
   * Plays all {@link shifty.Tweenable}s from their beginning.
   * @return {Scene}
   */
  play() {
    this.#tweenables.forEach(tweenable => tweenable.seek(0).resume());
    return this;
  }

  /**
   * @return {Scene}
   */
  pause() {
    this.#tweenables.forEach(tweenable => tweenable.pause());
    return this;
  }

  /**
   * @return {Scene}
   */
  resume() {
    this.#tweenables.forEach(tweenable => tweenable.resume());
    return this;
  }

  ///**
  // * @param {boolean} [gotoEnd]
  // * @return {Scene}
  // */
  //stop(gotoEnd) {}

  ///**
  // * @param {number} millisecond
  // * @return {Scene}
  // */
  //seek(millisecond) {}
}
