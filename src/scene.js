export class Scene {
  #tweenables = [];

  /**
   * @param {...shifty.Tweenable} tweenables
   * @constructs shifty.Scene
   */
  constructor(...tweenables) {
    tweenables.forEach(this.add.bind(this));
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
   * The {@link external:Promise}s for all {@link shifty.Tweenable}s in this
   * {@link shifty.Scene} that have been configured with {@link
   * shifty.Tweenable#setConfig}.
   * @member shifty.Scene#promises
   * @type {Array.<external:Promise>}
   * @readonly
   */
  get promises() {
    return this.#tweenables.map(({ _promise }) => _promise);
  }

  /**
   * @method shifty.Scene#add
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable}
   */
  add(tweenable) {
    this.#tweenables.push(tweenable);

    return tweenable;
  }

  /**
   * @method shifty.Scene#remove
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable}
   */
  remove(tweenable) {
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
    this.#tweenables.forEach(tweenable => tweenable.tween());

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
   * Resumes all paused {@link shifty.Tweenable}s.
   * @method shifty.Scene#play
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
}
