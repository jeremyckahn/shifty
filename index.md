# Shifty

### `npm install --save shifty`
## [Download](../shifty.js) • [Source](https://github.com/jeremyckahn/shifty)

Shifty is a JavaScript tweening engine designed to fit all of your animation needs. Core features include:

  * **Speed**: Shifty is optimized for performance.
  * **Flexibility**: Shifty provides numerous low-level APIs to hook into the animtion pipeline.
  * **Extensibility**: Shifty's {@link shifty.Tweenable} object works well as the base in a prototype chain.
  * **Small download size**: The standard distribution is less than 5Kb when minified and gzipped.

Shifty is a low-level animation solution.  This means that it does not perform any rendering, but it can be integrated into whatever rendering mechanism is most appropriate for your project.  Shifty is meant to be a simpler alternative to richer tools like the excellent [GreenSock animation platform](https://greensock.com/) while offering [comparable (and in some cases better) performance](https://codepen.io/jeremyckahn/pen/prMYXj).  This can be critical for some projects, particularly on mobile devices — [just ask Yelp](http://engineeringblog.yelp.com/2015/01/animating-the-mobile-web.html)!

If you feel that your project requires richer animation APIs and a robust plugin ecosystem, Greensock is an excellent choice.  If you prefer less overhead and a more permissive license (MIT), Shifty might be the animation engine for you!

Shifty is the heart of [Rekapi](http://rekapi.com/), a higher-level library for making keyframe animations. Shifty is also a low-level part of [Stylie](http://jeremyckahn.github.io/stylie/) and [Mantra](http://jeremyckahn.github.io/mantra/), a suite of graphical animation tools.

To create a basic tween, you could have something like this:

<p data-height="265" data-theme-id="0" data-slug-hash="dvzXLJ" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty 2 playground" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/dvzXLJ/">Shifty 2 playground</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

This snippet tweens and prints the `x` variable from 0 to 10 over one second, and then prints the final value.  You can animate as many properties in a single tween as you'd like.

**Please fork, use and contribute to Shifty!  It is distributed under the MIT License, and experimentation is encouraged.  If you find a bug or have a question about Shifty, please submit it via the [Github issue tracker](https://github.com/jeremyckahn/shifty/issues).**

## Comparison performance

<p data-height="658" data-theme-id="0" data-slug-hash="prMYXj" data-default-tab="result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty/GSAP/jQuery animation performance comparison" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/prMYXj/">Shifty/GSAP/jQuery animation performance comparison</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Examples

## Chained tweens

<p data-height="388" data-theme-id="0" data-slug-hash="NvQXqP" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Primise-chained tweens" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/NvQXqP/">Primise-chained tweens</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### Bouncing blocks

<p data-height="533" data-theme-id="0" data-slug-hash="OpzjRQ" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty Attachment Demo" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/OpzjRQ/">Shifty Attachment Demo</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### A helix!

<p data-height="725" data-theme-id="0" data-slug-hash="KWZvXY" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty Helix Demo" class="codepen">See the Pen <a href="http://codepen.io/jeremyckahn/pen/KWZvXY/">Shifty Helix Demo</a> by Jeremy Kahn (<a href="http://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="http://codepen.io">CodePen</a>.</p>
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
