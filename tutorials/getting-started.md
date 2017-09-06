## Creating a tween

This simplest way create a tween is to use {@link shifty.tween}:

```javascript
import { tween } from 'shifty';

tween({
  from: { x: 0, y: 50 },
  to: { x: 10, y: -30 },
  duration: 1500,
  easing: 'easeOutQuad',
  step: state => console.log(state)
}).then(
  () => console.log('All done!')
);
```

You can also instantiate a {@link shifty.Tweenable} to reuse tweens and have
more control over the animation:

```javascript
import { Tweenable } from 'shifty';

const tweenable = new Tweenable();

tweenable.setConfig({
  from: { x: 0,  y: 50  },
  to: { x: 10, y: -30 },
  duration: 1500,
  easing: 'easeOutQuad',
  step: state => console.log(state)
});

// tweenable.tween() could be called again later
tweenable.tween().then(() => console.log('All done!'));
```

<p data-height="350" data-theme-id="0" data-slug-hash="vJMjWK" data-default-tab="js,result" data-user="jeremyckahn" data-embed-version="2" data-pen-title="Shifty - Playground" class="codepen">See the Pen <a href="https://codepen.io/jeremyckahn/pen/vJMjWK/">Shifty - Playground</a> by Jeremy Kahn (<a href="https://codepen.io/jeremyckahn">@jeremyckahn</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
