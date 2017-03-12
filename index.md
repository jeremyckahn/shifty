# Shifty

Shifty is a JavaScript tweening engine designed to fit all of your animation needs. Core features include:

  * Speed: Shifty is optimized for performance.
  * Playback control (play/pause/stop).
  * Flexibility: Shifty provides numerous low-level APIs to hook into the animtion pipeline.
  * Extensibility: Shifty's `Tweenable` object works well as the base in a prototype chain.
  * Small download size: The standard distribution (which includes all extensions) is less than 4Kb when minified and gzipped.

Shifty is a low-level animation solution.  This means that it does not perform any rendering, but it can be integrated into whatever rendering mechanism is most appropriate for your project.  Shifty is meant to be a simpler, more lightweight and flexible alternative to richer tools like the excellent [GreenSock animation platform](https://greensock.com/).  While GreenSock edges it out in raw performance comparisons, [Shifty's performance is quite good](http://codepen.io/GreenSock/pen/10a1790cf256ac78ad65d5cc52c39126/) and offers a simpler, smaller package.  This can be critical for some projects, particularly on mobile devices.  [Just ask Yelp](http://engineeringblog.yelp.com/2015/01/animating-the-mobile-web.html).</a>

Shifty is the heart of [Rekapi](http://rekapi.com/), a higher-level library for making keyframe animations. Shifty is also a low-level part of [Stylie](http://jeremyckahn.github.io/stylie/), a graphical animation tool.

To create a basic tween, you could have something like this:

<p data-height="342" data-theme-id="0" data-slug-hash="ulLaI" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/ulLaI/'>Super simple Shifty sample</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

This snippet tweens and prints the <code>x</code> variable from 0 to 10 over one second, and then prints the final value.  You can animate as many properties in a single tween as you'd like.

Please fork, use and contribute to Shifty!  It is distributed under the MIT License, and experimentation is encouraged.  If you find a bug or have a question about Shifty, please submit it via the [Github issue tracker](https://github.com/jeremyckahn/shifty/issues).

## More examples

### Bouncing blocks

<p data-height="560" data-theme-id="0" data-slug-hash="mnLvB" data-default-tab="result" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/mnLvB/'>Shifty Attachment Demo</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### A helix!

<p data-height="700" data-theme-id="0" data-slug-hash="brzKu" data-default-tab="result" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/brzKu/'>Shifty Helix Demo</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### Tweening a number and printing it

<p data-height="315" data-theme-id="0" data-slug-hash="mDqhB" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/mDqhB/'>Tweening a number and printing it</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### Tweening with a custom easing formula

<p data-height="330" data-theme-id="0" data-slug-hash="qwldc" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/qwldc/'>Tweening with a custom easing formula</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### Shifting a color

<p data-height="330" data-theme-id="0" data-slug-hash="jJarp" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/jJarp/'>Shifting a color</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### Tweening the value of an Object

<p data-height="315" data-theme-id="0" data-slug-hash="dwCri" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/dwCri/'>Tweening the value of an Object</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>

### Tweening numbers within a string

<p data-height="315" data-theme-id="0" data-slug-hash="wHzhJ" data-default-tab="js" data-user="jeremyckahn" class='codepen'>See the Pen <a href='http://codepen.io/jeremyckahn/pen/wHzhJ/'>Tweening numbers within a string</a> by Jeremy Kahn (<a href='http://codepen.io/jeremyckahn'>@jeremyckahn</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//codepen.io/assets/embed/ei.js"></script>
