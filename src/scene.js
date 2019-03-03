const getTweenable = promiseOrTweenable =>
  promiseOrTweenable._tweenable
    ? promiseOrTweenable._tweenable
    : promiseOrTweenable;

export class Scene {
  #tweenables = [];

  /**
   * @param {...shifty.Tweenable|external:Promise} tweenables Can be {@link
   * shifty.Tweenable}s or {@link external:Promise}s returned from {@link
   * shifty.Tweenable#tween} and similar functions.
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
   * {@link shifty.Scene} that have one.
   * @member shifty.Scene#promises
   * @type {Array.<external:Promise>}
   * @readonly
   */
  get promises() {
    return this.#tweenables
      .map(({ _promise }) => _promise)
      .filter(isDefined => isDefined);
  }

  /**
   * @method shifty.Scene#add
   * @param {shifty.Tweenable|external:Promise} tweenable Can be {@link
   * shifty.Tweenable}s or {@link external:Promise}s returned from {@link
   * shifty.Tweenable#tween} and similar functions.
   * @return {shifty.Tweenable}
   */
  add(tweenable) {
    const wasAlreadyPlaying = this.isPlaying();
    const rootTweenable = getTweenable(tweenable);
    this.#tweenables.push(rootTweenable);

    // Sync the added Tweenable to the Scene's play state
    if (this.#tweenables.length > 1) {
      if (wasAlreadyPlaying) {
        rootTweenable.resume();
      } else {
        rootTweenable.pause();
      }
    }

    if (!rootTweenable._configured) {
      rootTweenable.setConfig();
    }

    rootTweenable._promise.then(() => this.remove(rootTweenable));

    return rootTweenable;
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
   * @method shifty.Scene#stop
   * @param {boolean} [gotoEnd]
   * @return {shifty.Scene}
   */
  stop(gotoEnd) {
    this.#tweenables.forEach(tweenable => tweenable.stop(gotoEnd));
    return this;
  }
}
