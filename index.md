# Shifty

**_The fastest JavaScript animation engine on the web_**

### `npm install --save shifty`

[![Current Shifty version](https://badgen.net/npm/v/shifty)](https://www.npmjs.com/package/shifty) [![Shifty license](https://badgen.net/github/license/jeremyckahn/shifty)](https://github.com/jeremyckahn/shifty/blob/develop/LICENSE-MIT) [![Downloads per week](https://badgen.net/npm/dw/shifty)](https://www.npmjs.com/package/shifty) [![GitHub stars](https://badgen.net/github/stars/jeremyckahn/shifty)](https://github.com/jeremyckahn/shifty/stargazers) [![Repo dependents](https://badgen.net/github/dependents-repo/jeremyckahn/shifty)](https://github.com/jeremyckahn/shifty/network/dependents)

## [Source code](https://github.com/jeremyckahn/shifty)

Shifty is a highly-optimized JavaScript tweening engine designed to fit all of your animation needs. It is a low-level animation library focused on optimal performance and flexibility that can easily be built upon and extended. Shifty's key benefits are:

- **Speed**: Shifty is engineered for [maximum animation performance and minimal memory usage](https://twitter.com/jeremyckahn/status/1336319804123308032).
- **Flexibility and extensibility**: Shifty can easily be built upon and extended via its unopinionated API.
- **Renderer-agnostic**: Shifty does not perform any rendering, but it can be easily integrated into whatever rendering mechanism is most appropriate for your project such as DOM or `<canvas>`.
- **`Promise` support**: Shifty's tweens are `await`-able [thenables](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then). ([Learn about the benefits of `async`/`await`-based animations here](https://dev.to/jeremyckahn/the-case-for-async-await-based-javascript-animations-pkl)).

### Load from CDN

| Variant | URL                                            | Size                                                                                                                                                            | Description                                                                                    |
| ------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Full    | `https://unpkg.com/shifty`                     | [![Shifty full bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/shifty@latest)](https://unpkg.com/shifty)                                         | Contains full library                                                                          |
| Core    | `https://unpkg.com/shifty/dist/shifty.core.js` | [![Shifty core bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/shifty@latest/dist/shifty.core.js)](https://unpkg.com/shifty/dist/shifty.core.js) | Contains {@link shifty.Tweenable}, {@link shifty.tween}, and {@link shifty.Tweenable.formulas} |

<p class="codepen" data-height="590" data-theme-id="dark" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="PoNNNye" style="height: 590px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Shifty async/await demo">
  <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/PoNNNye">
  Shifty async/await demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

Shifty powers [Stylie](https://jeremyckahn.github.io/stylie/) and [Mantra](https://jeremyckahn.github.io/mantra/), a suite of graphical animation tools. It is also the tweening engine used by [GDevelop](https://gdevelop-app.com/) and [ProgessBar.js](https://progressbarjs.readthedocs.io/en/latest/#how-it-works). Even [Yelp](http://engineeringblog.yelp.com/2015/01/animating-the-mobile-web.html) has used it!

**Please use, fork, and contribute to Shifty! It is distributed under the MIT License, and experimentation is encouraged. If you find a bug or have a question about Shifty, please submit it via the [GitHub issue tracker](https://github.com/jeremyckahn/shifty/issues).**

Shifty is a labor of love that will always be free and open source. If you've gotten value out of Shifty, **[please consider supporting the developer with a small donation](https://github.com/jeremyckahn#please-help-support-my-work)**!

## Comparison with other animation libraries

Shifty is meant to be a lightweight alternative to rich tools like the excellent [GreenSock Animation Platform](https://greensock.com/). It is intentionally minimalistic so that you can easily embed it into your projects. This works well with its MIT license, as you can redistribute it worry-free without bloating your app or [concerning yourself with royalties or licensing restrictions](https://greensock.com/licensing/).

<details>
<summary>Expand to see how Shifty compares to GreenSock's performance</summary>
<p class="codepen" data-height="550" data-theme-id="dark" data-default-tab="result" data-user="jeremyckahn" data-slug-hash="GRjZLZX" style="height: 550px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="GSAP vs Shifty">
  <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/GRjZLZX">
  GSAP vs Shifty</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
</details>

Shifty's tiny footprint compares very favorably against other popular animation libraries:

| Library       | Size                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shifty (full) | [![Shifty full bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/shifty@latest)](https://bundlephobia.com/result?p=shifty)                         |
| Shifty (core) | [![Shifty core bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/shifty@latest/dist/shifty.core.js)](https://unpkg.com/shifty/dist/shifty.core.js) |
| GreenSock     | [![GreenSock bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/gsap)](https://bundlephobia.com/result?p=gsap)                                      |
| AnimeJS       | [![AnimeJS bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/animejs)](https://bundlephobia.com/result?p=animejs)                                  |
| `@mojs/core`  | [![@core/mojs bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/@mojs/core)](https://bundlephobia.com/result?p=@mojs/core)                         |
| Velocity      | [![Velocity bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/velocity-animate)](https://bundlephobia.com/result?p=velocity-animate)               |
| Popmotion     | [![Popmotion bundle size](https://badgen.net/badgesize/gzip/https/unpkg.com/popmotion)](https://bundlephobia.com/result?p=popmotion)                            |

## Examples

### Sequencing

<p class="codepen" data-height="500" data-theme-id="dark" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="GRZZVLZ" style="height: 500px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Shifty Sequencing Demo">
  <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/GRZZVLZ">
  Shifty Sequencing Demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

### `await`ed tweens

<p data-height="388" data-theme-id="0" data-slug-hash="NvQXqP" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Primise-chained tweens" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/NvQXqP/">Primise-chained tweens</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

This next example demonstrates how `await`ed tweens interoperate well with standard JavaScript `try`/`catch` blocks, as well as infinite `while` loops. Typically you'd want to avoid intentionally infinite loops, but it's common to need animations to loop indefinitely. A `while (true)` loop is a simple way to achieve this. The ball in this demo pulsates repeatedly, but the animation loop is gracefully interrupted when the user clicks anywhere else within the demo. Response to the user's input is handled in `catch` blocks, wherein the ball swings over to where the user clicked. From there it continues to pulsate. With `await`ed tweens, you can have full control over the lifecycle of an animation with standard JavaScript programming constructs, rather than a library API that may or may not integrate well with other libraries.

<p class="codepen" data-height="542" data-theme-id="dark" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="abNmGwV" style="height: 542px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="async/await try/catch demo">
  <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/abNmGwV">
  async/await try/catch demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

### Tweening with a custom easing formula

<p data-height="265" data-theme-id="0" data-slug-hash="xqpLQg" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Tweening with a custom easing formula" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/xqpLQg/">Tweening with a custom easing formula</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Shifting a color

<p data-height="315" data-theme-id="0" data-slug-hash="jJarp" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifting a color" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/jJarp/">Shifting a color</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Tweening numbers within an arbitrary string

<p data-height="265" data-theme-id="0" data-slug-hash="YZYxge" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Tweening numbers within an arbitrary string" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/YZYxge/">Tweening numbers within an arbitrary string</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
