import { Tweenable } from './tweenable';
export declare class Scene {
    private _tweenables;
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
     * automatic tween cleanup. If you want to remove a {@link Tweenable} from a
     * {@link Scene}, you must do so explicitly with either {@link Scene#remove}
     * or {@link Scene#empty}.
     *
     * <p class="codepen" data-height="677" data-theme-id="0" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="qvZKbe" style="height: 677px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Scene Demo">
     * <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/qvZKbe/">
     * Shifty Scene Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
     * on <a href="https://codepen.io">CodePen</a>.</span>
     * </p>
     * <script async src="https://static.codepen.io/assets/embed/ei.js"></script>
     * @see https://codepen.io/jeremyckahn/pen/qvZKbe
     */
    constructor(...tweenables: Tweenable[]);
    /**
     * A copy of the internal {@link Tweenable}s array.
     */
    get tweenables(): Tweenable[];
    /**
     * The {@link !Promise}s for all {@link Tweenable}s in this {@link Scene} .
     * Note that each call of {@link Scene#tween} or {@link Scene#pause} creates
     * new {@link !Promise}s:
     *
     *     const scene = new Scene(new Tweenable());
     *     scene.play();
     *
     *     Promise.all(scene.promises).then(() =>
     *       // Plays the scene again upon completion, but a new promise is
     *       // created so this line only runs once.
     *       scene.play()
     *     );
     */
    get promises(): Promise<import("./types").PromisedData>[];
    /**
     * Add a {@link Tweenable} to be controlled by this {@link Scene}.
     * @return The {@link Tweenable} that was added.
     */
    add(tweenable: Tweenable): Tweenable;
    /**
     * Remove a {@link Tweenable} that is controlled by this {@link Scene}.
     * @return The {@link Tweenable} that was removed.
     */
    remove(tweenable: Tweenable): Tweenable;
    /**
     * {@link Scene#remove | Remove} all {@link Tweenable}s in this {@link
     * Scene}.
     * @return The {@link Tweenable}s that were removed.
     */
    empty(): Tweenable[];
    /**
     * Whether or not any {@link Tweenable} in this {@link Scene} is playing.
     */
    get isPlaying(): boolean;
    /**
     * Call {@link Tweenable#tween} on all {@link Tweenable}s in this {@link
     * Scene}.
     */
    tween(): this;
    /**
     * Call {@link Tweenable#pause} all {@link Tweenable}s in this {@link Scene}.
     */
    pause(): this;
    /**
     * Call {@link Tweenable#resume} on all paused {@link Tweenable}s in this
     * scene.
     */
    resume(): this;
    /**
     * Call {@link Tweenable#stop} on all {@link Tweenable}s in this {@link
     * Scene}.
     */
    stop(gotoEnd: boolean): this;
}
