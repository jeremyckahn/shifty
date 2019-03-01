export class Scene {
  #tweenables;

  /**
   * @param {...shifty.Tweenable} tweenables
   * @constructs shifty.Scene
   */
  constructor(...tweenables) {
    this.#tweenables = tweenables;
  }

  /**
   * A copy of the internal Tweenables array.
   * @member shifty.Scene#tweenables
   * @type {Array.<shifty.Tweenable>}
   * @readonly
   */
  get tweenables() {
    return [...this.#tweenables];
  }

  /**
   * @method shifty.Scene#addTweenable
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable}
   */
  addTweenable(tweenable) {
    this.#tweenables.push(tweenable);

    return tweenable;
  }

  /**
   * @method shifty.Scene#removeTweenable
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable}
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
   * @method shifty.Scene#isPlaying
   * @return {boolean}
   */
  isPlaying() {
    return this.#tweenables.some(tweenable => tweenable.isPlaying());
  }

  /**
   * Plays all {@link shifty.Tweenable}s from their beginning.
   * @method shifty.Scene#play
   * @return {shifty.Scene}
   */
  play() {
    this.#tweenables.forEach(tweenable => tweenable.seek(0).resume());
    return this;
  }

  /**
   * @method shifty.Scene#pause
   * @return {shifty.Scene}
   */
  pause() {
    this.#tweenables.forEach(tweenable => tweenable.pause());
    return this;
  }

  /**
   * @method shifty.Scene#resume
   * @return {shifty.Scene}
   */
  resume() {
    this.#tweenables.forEach(tweenable => tweenable.resume());
    return this;
  }

  /**
   * @method shifty.Scene#stop
   * @param {boolean} [gotoEnd]
   * @return {shifty.Scene}
   */
  stop(gotoEnd) {
    this.#tweenables.forEach(tweenable => tweenable.stop(gotoEnd));
    return this;
  }

  /**
   * @method shifty.Scene#seek
   * @param {number} millisecond
   * @return {shifty.Scene}
   */
  seek(millisecond) {
    this.#tweenables.forEach(tweenable => tweenable.seek(millisecond));
    return this;
  }
}
