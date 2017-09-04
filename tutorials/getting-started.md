## Creating a tween

This simplest way create a tween is to use {@link shifty.tween}:

```javascript
import { tween } from 'shifty';

tween({
  from: { x: 0,  y: 50  },
  to: { x: 10, y: -30 },
  duration: 1500,
  easing: 'easeOutQuad',
  step: state => console.log(state)
}).then(
  () => console.log('All done!')
);
```
