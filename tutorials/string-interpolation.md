In addition to raw `Number`s, Shifty can tween numbers inside of strings.
Among other things, this allows you to animate CSS properties. For example,
you can do this:

```js
import { tween } from 'shifty'

tween({
  from: { transform: 'translateX(45px)' },
  to: { transform: 'translateX(90px)' },
})
```

`translateX(45)` will be tweened to `translateX(90)`. To demonstrate:

<p data-height="273" data-theme-id="0" data-slug-hash="PKgKqb" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - Basic string interpolation demo" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/PKgKqb/">Shifty - Basic string interpolation demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Another use for this is animating colors:

<p data-height="265" data-theme-id="0" data-slug-hash="wqZqWe" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - Basic string interpolation demo" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/wqZqWe/">Shifty - Basic string interpolation demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

Shifty also supports hexadecimal colors, in both long (`#ff00ff`) and short
(`#f0f`) forms. Be aware that hexadecimal input values will be converted into
the equivalent RGB output values. This is done to optimize for performance.

<p data-height="265" data-theme-id="0" data-slug-hash="dzLzOo" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - Hex color string interpolation demo" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/dzLzOo/">Shifty - Hex color string interpolation demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## Easing support

Easing works somewhat differently with string interpolation. This is because
some CSS properties have multiple values in them, and you might need to tween
each value along its own easing curve. A basic example:

<p data-height="265" data-theme-id="0" data-slug-hash="OjGjpm" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - String interpolation with single ease demo" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/OjGjpm/">Shifty - String interpolation with single ease demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

In this case, the values for `translateX` and `translateY` are always the same
for each tick of the tween, because they have the same start and end points and
both use the same easing curve. We can also tween `translateX` and
`translateY` along independent curves:

<p data-height="265" data-theme-id="0" data-slug-hash="xLeLdv" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - String interpolation with multiple eases demo" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/xLeLdv/">Shifty - String interpolation with multiple eases demo</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

`translateX` and `translateY` are not in sync anymore, because `easeInQuad` was
specified for `translateX` and `bounce` for `translateY`. Mixing and matching
easing curves can make for some interesting motion in your animations!

The order of the space-separated easing curves correspond the number values
they apply to. If there are more number values than easing curves listed, the
last easing curve listed is used for the remaining numbers.

<p data-height="438" data-theme-id="0" data-slug-hash="dzLwQX" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - Basic CSS animation" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/dzLwQX/">Shifty - Basic CSS animation</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

## A word on performance

Shifty's string interpolation is powerful because it is fully abstract — that
is, it can handle just about any kind of string format. However, that
abstraction comes at a performance cost. In many cases this cost is
insignificant, but if Shifty is playing many animations simultaneously, you may
see some slowdown. If you experience performance issues when animating strings,
consider finding an alternative solution that relies solely on raw numbers. For
instance, if your animation looks like this:

```js
const div = document.querySelector('div')

shifty.tween({
  from: { transform: 'translateX(0px) translateY(0px)' },
  to: { transform: 'translateX(100px) translateY(100px)' },
  easing: { transform: 'easeInQuad' },
  render: ({ transform }) => (div.style.transform = transform),
})
```

You might rewrite it without strings like this for better performance:

```js
const div = document.querySelector('div')

shifty.tween({
  from: { x: 0, y: 0 },
  to: { x: 100, y: 100 },
  easing: { transform: 'easeInQuad' },
  render: ({ x, y }) =>
    (div.style.transform = `translateX(${x}px) translateY(${y}px)`),
})
```
