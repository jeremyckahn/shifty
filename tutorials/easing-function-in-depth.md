Shifty supports {@link Tweenable.easing | a number of easing curves}.

## Using multiple easing curves

Shifty supports tweens that have different easing curves for each property.
Having multiple easing curves on a single tween can make for some really
interesting animations because you aren't constrained to moving things in a
straight line. You can make curved motions! To do this, simply supply `easing`
as an Object, rather than a string:

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

## Reusable custom easing functions

You can define custom easing curves by attaching methods to {@link Tweenable.easing}.

```ts
Tweenable.easing['customEasing'] = (pos: number) => Math.pow(pos, 2)
```

## Per-tween custom easing functions

You are not limited to attaching functions to {@link Tweenable.easing}. You
can also supply a custom easing function directly to {@link tween}:

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
