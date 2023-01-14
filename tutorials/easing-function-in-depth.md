Shifty supports a number of easing formulas, which you can see in
[`easing-functions.js`](easing-functions.js.html). You can add new easing
formulas by attaching methods to {@link shifty.Tweenable.formulas}.

## Using multiple easing formulas

Shifty supports tweens that have different easing formulas for each property.
Having multiple easing formulas on a single tween can make for some really
interesting animations, because you aren't constrained to moving things in a
straight line. You can make curves! To do this, simply supply `easing` as an
Object, rather than a string:

```javascript
tween({
  from: {
    x: 0,
    y: 0,
  },
  to: {
    x: 250,
    y: 150,
  },
  easing: {
    x: 'swingFromTo',
    y: 'bounce',
  },
})
```

## Per-tween custom easing functions

You are not limited to attaching functions to {@link
shifty.Tweenable.formulas}. You can also supply a custom easing function
directly to {@link shifty.tween}:

```javascript
tween({
  from: {
    x: 0,
    y: 0,
  },
  to: {
    x: 250,
    y: 150,
  },
  easing: pos => Math.pow(pos, 3),
})
```

Or even an Object of mixed strings and functions:

```javascript
tween({
  from: {
    x: 0,
    y: 0,
  },
  to: {
    x: 250,
    y: 150,
  },
  easing: {
    x: pos => Math.pow(pos, 3),
    y: 'linear',
  },
})
```

## Using an array of cubic bezier points

You can provide an array of four `number`s as `easing` to represent a [cubic
Bezier curve](https://cubic-bezier.com/):

```javascript
tween({
  from: {
    x: 0,
  },
  to: {
    x: 250,
  },
  // Equivalent to a linear curve
  easing: [0.25, 0.25, 0.75, 0.75],
})
```

{@link shifty.interpolate} also supports all formats for `easing`.
