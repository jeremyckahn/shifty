import { Data, Easing, EasingFunction, EasingObject, Filter, FinishFunction, FulfillmentHandler, PromisedData, RejectionHandler, RenderFunction, ScheduleFunction, StartFunction, TweenRawState, TweenState, TweenableConfig } from './types';
/**
 * Strictly for testing.
 */
export declare const resetList: () => void;
/**
 * Strictly for testing.
 */
export declare const getListHead: () => Tweenable | null;
/**
 * Strictly for testing.
 */
export declare const getListTail: () => Tweenable | null;
/**
 * Calculates the interpolated tween values of an object for a given timestamp.
 * @ignore
 */
export declare const tweenProps: <T extends TweenRawState>(forPosition: number, currentState: T, originalState: T, targetState: T, duration: number, timestamp: number, easing: Easing) => T;
/**
 * Process all tweens currently managed by Shifty for the current tick. This
 * does not perform any timing or update scheduling; it is the logic that is
 * run *by* the scheduling functionality. Specifically, it computes the state
 * and calls all of the relevant {@link TweenableConfig} functions supplied to
 * each of the tweens for the current point in time (as determined by {@link
 * Tweenable.now}).
 *
 * This is a low-level API that won't be needed in the majority of situations.
 * It is primarily useful as a hook for higher-level animation systems that are
 * built on top of Shifty. If you need this function, it is likely you need to
 * pass something like `() => {}` to {@link Tweenable.setScheduleFunction},
 * override {@link Tweenable.now} and manage the scheduling logic yourself.
 *
 * @see https://github.com/jeremyckahn/shifty/issues/109
 */
export declare const processTweens: () => void;
/**
 * Handles the update logic for one tick of a tween.
 */
export declare const scheduleUpdate: () => void;
/**
 * Creates an EasingObject or EasingFunction from a string, a function or
 * another easing Object. If `easing` is an Object, then this function clones
 * it and fills in the missing properties with `"linear"`.
 *
 * If the tween has only one easing across all properties, that function is
 * returned directly.
 */
export declare const composeEasingObject: (fromTweenParams: TweenState, easing?: Easing, composedEasing?: EasingObject | EasingFunction) => EasingObject | EasingFunction;
export declare class Tweenable {
    /**
     * Required for Promise implementation
     * @ignore
     */
    [Symbol.toStringTag]: string;
    /**
     * Returns the current timestamp.
     */
    static now: () => number;
    /**
     * Sets a custom schedule function.
     *
     * By default, Shifty uses
     * [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame)
     * is used if available, otherwise {@link !setTimeout} is used.
     */
    static setScheduleFunction: (fn: ScheduleFunction) => ScheduleFunction;
    /**
     * The {@link Filter}s available for use.  These filters are automatically
     * applied. You can define your own {@link Filter}s and attach them to this
     * object.
     *
     * ```ts
     * Tweenable.filters['customFilter'] = {
     *   doesApply: () => true
     *   tweenCreated: () => console.log('tween created!')
     * }
     * ```
     */
    static filters: Record<string, Filter>;
    /**
     * You can define custom easing curves by attaching {@link EasingFunction}s
     * to this static object.
     *
     * ```ts
     * Tweenable.easing['customEasing'] = (pos: number) => Math.pow(pos, 2)
     * ```
     */
    static easing: Record<string, EasingFunction>;
    /**
     * @ignore
     */
    _next: Tweenable | null;
    /**
     * @ignore
     */
    _previous: Tweenable | null;
    /**
     * @ignore
     */
    _config: TweenableConfig;
    /**
     * @ignore
     */
    _data: Data;
    /**
     * @ignore
     */
    _delay: number;
    /**
     * @ignore
     */
    _duration: number;
    /**
     * @ignore
     */
    _filters: Filter[];
    /**
     * @ignore
     */
    _timestamp: number | null;
    /**
     * @ignore
     */
    _hasEnded: boolean;
    /**
     * @ignore
     */
    _resolve: FinishFunction;
    /**
     * @ignore
     */
    _reject: ((data: PromisedData) => void) | null;
    /**
     * @ignore
     */
    _currentState: TweenState;
    /**
     * @ignore
     */
    _originalState: TweenState;
    /**
     * @ignore
     */
    _targetState: TweenState;
    /**
     * @ignore
     */
    _start: StartFunction;
    /**
     * @ignore
     */
    _render: RenderFunction;
    /**
     * @ignore
     */
    _promiseCtor: typeof Promise | null;
    /**
     * @ignore
     */
    _promise: Promise<PromisedData> | null;
    /**
     * @ignore
     */
    _isPlaying: boolean;
    /**
     * @ignore
     */
    _pausedAtTime: number | null;
    /**
     * @ignore
     */
    _easing: EasingObject | EasingFunction;
    constructor(
    /**
     * The values that the initial tween should start at if a {@link
     * TweenableConfig#from} value is not provided to {@link Tweenable#tween}
     * or {@link Tweenable#setConfig}.
     */
    initialState?: TweenState, 
    /**
     * Configuration object to be passed to {@link Tweenable#setConfig}.
     */
    config?: TweenableConfig);
    /**
     * Applies a filter to Tweenable instance.
     * @ignore
     */
    _applyFilter(filterType: keyof Omit<Filter, 'doesApply'>): void;
    /**
     * {@link Tweenable#setConfig Configure} and start a tween. If this {@link
     * Tweenable}'s instance is already running, then it will stop playing the
     * old tween and immediately play the new one.
     */
    tween(config?: TweenableConfig): Tweenable;
    /**
     * Configures a tween without starting it. Aside from {@link
     * TweenableConfig.delay}, {@link TweenableConfig.from}, and {@link
     * TweenableConfig.to}, each configuration option will automatically default
     * to the same option used in the preceding tween of the {@link Tweenable}
     * instance.
     */
    setConfig(config?: TweenableConfig): Tweenable;
    /**
     * Overrides any `finish` function passed via a {@link TweenableConfig}.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
     */
    then(onFulfilled?: FulfillmentHandler, onRejected?: RejectionHandler): Promise<PromisedData>;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch
     */
    catch(onRejected: RejectionHandler): Promise<PromisedData>;
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
     */
    finally(onFinally?: typeof Promise.prototype.finally): Promise<PromisedData>;
    /**
     * Returns the current state of the tween.
     */
    get state(): TweenState;
    /**
     * Set the current tween state.
     */
    setState(
    /**
     * The state to set.
     */
    state: TweenState): void;
    /**
     * Pauses a tween. Paused tweens can be {@link resume}d from the point at
     * which they were paused. If a tween is not running, this is a no-op.
     */
    pause(): Tweenable;
    /**
     * Resumes a {@link pause}d tween.
     */
    resume(): Tweenable;
    /**
     * @ignore
     */
    _resume(currentTime?: number): Tweenable;
    /**
     * Move the state of the animation to a specific point in the tween's
     * timeline. If the animation is not running, this will cause the tween's
     * {@link TweenableConfig.render | render} handler to be called.
     */
    seek(
    /**
     * The millisecond of the animation to seek to.  This must not be less than
     * `0`.
     */
    millisecond: number): Tweenable;
    /**
     * Stops a tween. If a tween is not running, this is a no-op. This method
     * does **not** reject the tween {@link !Promise}. For that, use {@link
     * Tweenable#cancel}.
     */
    stop(
    /**
     * If `false` or not provided, the tween just stops at its current state.
     * If `true`, the tweened object's values are instantly set {@link
     * TweenableConfig.to | to the target values}.
     */
    gotoEnd?: boolean): Tweenable;
    /**
     * {@link Tweenable#stop}s a tween and also rejects its {@link !Promise}. If
     * a tween is not running, this is a no-op. Prevents calling any provided
     * {@link TweenableConfig.finish} function.
     * @see https://github.com/jeremyckahn/shifty/issues/122
     */
    cancel(
    /**
     * This gets propagated to {@link Tweenable#stop}.
     */
    gotoEnd?: boolean): Tweenable;
    /**
     * Whether or not a tween is running (not paused or completed).
     */
    get isPlaying(): boolean;
    /**
     * Whether or not a tween has completed.
     */
    get hasEnded(): boolean;
    /**
     * Get and optionally set the data that gets passed as `data` to {@link
     * StartFunction}, {@link FinishFunction} and {@link RenderFunction}.
     */
    data(data?: Data): Data;
    /**
     * `delete` all {@link
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
     * | own} properties.  Call this when the {@link Tweenable} instance is no
     * longer needed to free memory.
     */
    dispose(): void;
}
/**
 * Standalone convenience method that functions identically to {@link
 * Tweenable#tween}. You can use this to create tweens without needing to
 * explicitly set up a {@link Tweenable} instance.
 *
 * ```
 * import { tween } from 'shifty';
 *
 * tween({ from: { x: 0 }, to: { x: 10 } }).then(
 *   () => console.log('All done!')
 * );
 * ```
 */
export declare function tween(config?: TweenableConfig): Tweenable;
/**
 * Determines whether or not a heartbeat tick should be scheduled. This is
 * generally only useful for testing environments where Shifty's continuous
 * heartbeat mechanism causes test runner issues.
 *
 * If you are using Jest, it is recommended to put this in a global `afterAll`
 * hook. If you don't already have a Jest setup file, follow the setup in [this
 * StackOverflow post](https://stackoverflow.com/a/57647146), and then add this
 * to it:
 *
 * ```
 * import { shouldScheduleUpdate } from 'shifty'
 *
 * afterAll(() => {
 *   shouldScheduleUpdate(false)
 * })
 * ```
 * @see https://github.com/jeremyckahn/shifty/issues/156
 */
export declare const shouldScheduleUpdate: (doScheduleUpdate: boolean) => void;
