# Shifty

### `npm install --save shifty`

## [Download](../shifty.js) • [Source](https://github.com/jeremyckahn/shifty)

Shifty is a JavaScript tweening engine designed to fit all of your animation needs. Shifty's key benefits include:

- **Speed**: Shifty is optimized for smooth animation performance, even with many concurrent animations.
- **Flexibility and extensibility**: Shifty provides numerous low-level APIs to let you hook into its animation pipeline.
- **Small footprint**: The full build is [less than 6Kb when minified and gzipped](https://bundlephobia.com/result?p=shifty).
- **`Promise` support**: Shifty's tweens can be `await`ed. [Learn about the benefits of `async`/`await`-based animations](https://dev.to/jeremyckahn/the-case-for-async-await-based-javascript-animations-pkl).

<p class="codepen" data-height="590" data-theme-id="dark" data-default-tab="js,result" data-user="jeremyckahn" data-slug-hash="PoNNNye" style="height: 590px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Shifty async/await demo">
  <span>See the Pen <a href="https://codepen.io/jeremyckahn/pen/PoNNNye">
  Shifty async/await demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

Shifty is a low-level animation solution. It does not perform any rendering, but it can be integrated into whatever rendering mechanism is most appropriate for your project. Shifty is meant to be a lightweight alternative to richer tools like the excellent [GreenSock Animation Platform](https://greensock.com/).

Shifty powers [Stylie](https://jeremyckahn.github.io/stylie/) and [Mantra](https://jeremyckahn.github.io/mantra/), a suite of graphical animation tools. It is also the tweening engine used by [GDevelop](https://gdevelop-app.com/) and [ProgessBar.js](https://progressbarjs.readthedocs.io/en/latest/#how-it-works). Even [Yelp](http://engineeringblog.yelp.com/2015/01/animating-the-mobile-web.html) has used it!

If you're looking for a high-performance `Promise`-based animation engine with low overhead and a permissive license (MIT), Shifty might be the right choice for you!

**Please fork, use and contribute to Shifty! It is distributed under the MIT License, and experimentation is encouraged. If you find a bug or have a question about Shifty, please submit it via the [Github issue tracker](https://github.com/jeremyckahn/shifty/issues).**

### Getting started with Shifty

Take a look at [the Getting Started guide]{@tutorial getting-started} to hit the ground running. The most important class in Shifty is [`Tweenable`]{@link shifty.Tweenable}, but you may also find [`Scene`]{@link shifty.Scene} handy for controlling groups of tweens.

## Demos

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

### Tweening with a custom easing formula

<p data-height="265" data-theme-id="0" data-slug-hash="xqpLQg" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Tweening with a custom easing formula" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/xqpLQg/">Tweening with a custom easing formula</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Shifting a color

<p data-height="315" data-theme-id="0" data-slug-hash="jJarp" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifting a color" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/jJarp/">Shifting a color</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Tweening numbers within an arbitrary string

<p data-height="265" data-theme-id="0" data-slug-hash="YZYxge" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Tweening numbers within an arbitrary string" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/YZYxge/">Tweening numbers within an arbitrary string</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
