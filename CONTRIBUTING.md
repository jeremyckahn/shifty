# Contributing to Shifty

First of all, thanks! Community contribution is what makes open source great.
If you find a bug or would like to make a feature request, please report it on
the [issue tracker](https://github.com/jeremyckahn/shifty/issues). If you
would like to make changes to the code yourself, read on!

## Getting started

To get started with hacking on Shifty, you'll need to get all of the
development dependencies with [npm](https://npmjs.org/) (and, by extension,
[Node](http://nodejs.org/)):

```
$: npm ci
```

## Pull Requests and branches

The project maintainer ([@jeremyckahn](https://github.com/jeremyckahn)) manages
releases. `main` contains the latest stable code. When making a Pull Request,
please branch off of `main` and request to merge back into it.

## Building

```
$: npm run build
```

## Testing

Please make sure that all tests pass before submitting a Pull Request.

```
$: npm test
```

You can also run the tests in the browser. They are in `tests/`. If you are
adding a feature or fixing a bug, please add a test!

## Style

Please try to remain consitent with existing code. To automatically check for
style issues or other potential problems, you can run:

```
$: npm run lint
```
