export class Scene {
  #tweenables = [];

  /**
   * The {@link shifty.Scene} class provides a way to control groups of {@link
   * shifty.Tweenable}s. It is lightweight, minimalistic, and meant to provide
   * performant {@link shifty.Tweenable} batch control that users of Shifty
   * might otherwise have to implement themselves. It is **not** a robust
   * timeline solution, and it does **not** provide utilities for sophisticated
   * animation sequencing or orchestration. If that is what you need for your
   * project, consider using a more robust tool such as
   * [Rekapi](http://jeremyckahn.github.io/rekapi/doc/) (a timeline layer built
   * on top of Shifty).
   *
   * Please be aware that {@link shifty.Scene} does **not** perform any
   * automatic cleanup. If you want to remove a {@link shifty.Tweenable} from a
   * {@link shifty.Scene}, you must do so explicitly with either {@link
   * shifty.Scene#remove} or {@link shifty.Scene#empty}.
   *
   * <p class="codepen" data-height="677" data-theme-id="0" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="qvZKbe" style="height: 677px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Scene Demo">
   * <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/qvZKbe/">
   * Shifty Scene Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
   * on <a href="https://codepen.io">CodePen</a>.</span>
   * </p>
   * <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
   * @param {...shifty.Tweenable} tweenables
   * @see https://codepen.io/jeremyckahn/pen/qvZKbe
   * @constructs shifty.Scene
   */
  constructor(...tweenables) {
    tweenables.forEach(this.add.bind(this));
  }

  /**
   * A copy of the internal {@link shifty.Tweenable}s array.
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
   * shifty.Tweenable#setConfig}. Note that each call of {@link
   * shifty.Scene#play} or {@link shifty.Scene#pause} creates new {@link
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
   * @member shifty.Scene#promises
   * @type {Array.<external:Promise>}
   * @readonly
   */
  get promises() {
    return this.#tweenables.map(({ _promise }) => _promise);
  }

  /**
   * Add a {@link shifty.Tweenable} to be controlled by this {@link
   * shifty.Scene}.
   * @method shifty.Scene#add
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable} The {@link shifty.Tweenable} that was added.
   */
  add(tweenable) {
    this.#tweenables.push(tweenable);

    return tweenable;
  }

  /**
   * Remove a {@link shifty.Tweenable} that is controlled by this {@link
   * shifty.Scene}.
   * @method shifty.Scene#remove
   * @param {shifty.Tweenable} tweenable
   * @return {shifty.Tweenable} The {@link shifty.Tweenable} that was removed.
   */
  remove(tweenable) {
    const index = this.#tweenables.indexOf(tweenable);

    if (~index) {
      this.#tweenables.splice(index, 1);
    }

    return tweenable;
  }

  /**
   * [Remove]{@link shifty.Scene#remove} all {@link shifty.Tweenable}s in this {@link
   * shifty.Scene}.
   * @method shifty.Scene#empty
   * @return {Array.<shifty.Tweenable>} The {@link shifty.Tweenable}s that were
   * removed.
   */
  empty() {
    // Deliberate of the tweenables getter here to create a temporary array
    return this.tweenables.map(this.remove.bind(this));
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
   * Play all {@link shifty.Tweenable}s from their beginning.
   * @method shifty.Scene#play
   * @return {shifty.Scene}
   */
  play() {
    this.#tweenables.forEach(tweenable => tweenable.tween());

    return this;
  }

  /**
   * {@link shifty.Tweenable#pause} all {@link shifty.Tweenable}s in this
   * {@link shifty.Scene}.
   * @method shifty.Scene#pause
   * @return {shifty.Scene}
   */
  pause() {
    this.#tweenables.forEach(tweenable => tweenable.pause());
    return this;
  }

  /**
   * {@link shifty.Tweenable#resume} all paused {@link shifty.Tweenable}s.
   * @method shifty.Scene#resume
   * @return {shifty.Scene}
   */
  resume() {
    this.#tweenables.forEach(tweenable => tweenable.resume());

    return this;
  }

  /**
   * {@link shifty.Tweenable#stop} all {@link shifty.Tweenable}s in this {@link
   * shifty.Scene}.
   * @method shifty.Scene#stop
   * @param {boolean} [gotoEnd]
   * @return {shifty.Scene}
   */
  stop(gotoEnd) {
    this.#tweenables.forEach(tweenable => tweenable.stop(gotoEnd));
    return this;
  }
}
