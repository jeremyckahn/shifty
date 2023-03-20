/** @typedef {import("./tweenable").Tweenable} Tweenable */

export class Scene {
  #tweenables = []

  /**
   * The {@link Scene} class provides a way to control groups of {@link
   * Tweenable}s. It is lightweight, minimalistic, and meant to provide
   * performant {@link Tweenable} batch control that users of Shifty
   * might otherwise have to implement themselves. It is **not** a robust
   * timeline solution, and it does **not** provide utilities for sophisticated
   * animation sequencing or orchestration. If that is what you need for your
   * project, consider using a more robust tool such as
   * [Rekapi](http://jeremyckahn.github.io/rekapi/doc/) (a timeline layer built
   * on top of Shifty).
   *
   * Please be aware that {@link Scene} does **not** perform any
   * automatic cleanup. If you want to remove a {@link Tweenable} from a
   * {@link Scene}, you must do so explicitly with either {@link
   * Scene#remove} or {@link Scene#empty}.
   *
   * <p class="codepen" data-height="677" data-theme-id="0" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="qvZKbe" style="height: 677px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Scene Demo">
   * <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/qvZKbe/">
   * Shifty Scene Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
   * on <a href="https://codepen.io">CodePen</a>.</span>
   * </p>
   * <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
   * @param {...Tweenable} tweenables
   * @see https://codepen.io/jeremyckahn/pen/qvZKbe
   * @constructs Scene
   * @memberof shifty
   */
  constructor(...tweenables) {
    tweenables.forEach(this.add.bind(this))
  }

  /**
   * A copy of the internal {@link Tweenable}s array.
   * @member Scene#tweenables
   * @type {Array.<Tweenable>}
   */
  get tweenables() {
    return [...this.#tweenables]
  }

  /**
   * A list of {@link Tweenable}s in the scene that have not yet ended (playing
   * or not).
   * @member Scene#playingTweenables
   * @type {Array.<Tweenable>}
   */
  get playingTweenables() {
    return this.#tweenables.filter(tweenable => !tweenable.hasEnded())
  }

  /**
   * The {@link external:Promise}s for all {@link Tweenable}s in this
   * {@link Scene} that have been configured with {@link
   * Tweenable#setConfig}. Note that each call of {@link
   * Scene#play} or {@link Scene#pause} creates new {@link
   * external:Promise}s:
   *
   *     const scene = new Scene(new Tweenable());
   *     scene.play();
   *
   *     Promise.all(scene.promises).then(() =>
   *       // Plays the scene again upon completion, but a new promise is
   *       // created so this line only runs once.
   *       scene.play()
   *     );
   *
   * @member Scene#promises
   * @type {Array.<Promise<any>>}
   */
  get promises() {
    return this.#tweenables.map(tweenable => tweenable.then())
  }

  /**
   * Add a {@link Tweenable} to be controlled by this {@link
   * Scene}.
   * @method Scene#add
   * @param {Tweenable} tweenable
   * @return {Tweenable} The {@link Tweenable} that was added.
   */
  add(tweenable) {
    this.#tweenables.push(tweenable)

    return tweenable
  }

  /**
   * Remove a {@link Tweenable} that is controlled by this {@link
   * Scene}.
   * @method Scene#remove
   * @param {Tweenable} tweenable
   * @return {Tweenable} The {@link Tweenable} that was removed.
   */
  remove(tweenable) {
    const index = this.#tweenables.indexOf(tweenable)

    if (~index) {
      this.#tweenables.splice(index, 1)
    }

    return tweenable
  }

  /**
   * [Remove]{@link Scene#remove} all {@link Tweenable}s in this {@link
   * Scene}.
   * @method Scene#empty
   * @return {Array.<Tweenable>} The {@link Tweenable}s that were
   * removed.
   */
  empty() {
    // Deliberate of the tweenables getter here to create a temporary array
    return this.tweenables.map(this.remove.bind(this))
  }

  /**
   * Is `true` if any {@link Tweenable} in this {@link Scene} is
   * playing.
   * @method Scene#isPlaying
   * @return {boolean}
   */
  isPlaying() {
    return this.#tweenables.some(tweenable => tweenable.isPlaying())
  }

  /**
   * Play all {@link Tweenable}s from their beginning.
   * @method Scene#play
   * @return {Scene}
   */
  play() {
    this.#tweenables.forEach(tweenable => tweenable.tween())

    return this
  }

  /**
   * {@link Tweenable#pause} all {@link Tweenable}s in this
   * {@link Scene}.
   * @method Scene#pause
   * @return {Scene}
   */
  pause() {
    this.#tweenables.forEach(tweenable => tweenable.pause())
    return this
  }

  /**
   * {@link Tweenable#resume} all paused {@link Tweenable}s.
   * @method Scene#resume
   * @return {Scene}
   */
  resume() {
    this.playingTweenables.forEach(tweenable => tweenable.resume())

    return this
  }

  /**
   * {@link Tweenable#stop} all {@link Tweenable}s in this {@link
   * Scene}.
   * @method Scene#stop
   * @param {boolean} [gotoEnd]
   * @return {Scene}
   */
  stop(gotoEnd) {
    this.#tweenables.forEach(tweenable => tweenable.stop(gotoEnd))
    return this
  }
}
