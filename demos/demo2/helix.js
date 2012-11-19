/*global window:true, setTimeout:true */
(function (global) {
  var CYCLE_SPEED = 1500
    ,HELIX_WIDTH = 300
    ,SEGMENT_BUFFER = 0.2
    ,startTime
    ,pausedAtTime
    ,segmentContainer
    ,segments
    ,stepStateLists
    ,updateHandle
    ,isPlaying
    ,i;

  function now () {
    return +(new Date());
  }

  function getPosition (loopPosition, startBuffer) {
    var moddedLoopPosition
      ,interpolator
      ,interpolatedValue;

    if ((loopPosition - startBuffer) < 0) {
      return 0;
    }

    interpolator = moddedLoopPosition = ((loopPosition - startBuffer) % 2);

    if (moddedLoopPosition > 1) {
      interpolator = moddedLoopPosition - 1;
    }

    interpolatedValue = global.Tweenable.interpolate({
        from: {
          'left': 0
        },
        to: {
          'left': HELIX_WIDTH
        },
        position: interpolator,
        easing: 'easeInOutSine'
    });

    if (moddedLoopPosition > 1) {
      return {
        'left': HELIX_WIDTH - interpolatedValue.left
      }
    } else {
      return interpolatedValue;
    }
  }

  function updateSegment (index, loopPosition) {
    var segment
      ,calculated;

    segment = segments[index];
    calculated = getPosition(loopPosition, index * SEGMENT_BUFFER);

    var style = segment.style;
    style.MozTransform = style.webkitTransform =
      'translateX(' + parseFloat(calculated.left) + 'px)';
  }

  function updateSegments (startTime, callback) {
    var i
      ,timeDelta
      ,normalizedTime;

    timeDelta = now() - startTime;
    normalizedTime = timeDelta / CYCLE_SPEED;

    for (i = 0; i < segments.length; i++) {
      updateSegment(i, normalizedTime);
    }

    callback();
  }

  function loop () {
    updateHandle = setTimeout(function () {
      updateSegments(startTime, loop);
    }, 1000 / 60);
  }

  function pause () {
    if (isPlaying === false) {
      return;
    }

    isPlaying = false;
    pausedAtTime = Tweenable.now();
    clearTimeout(updateHandle);
  }

  function play () {
    if (isPlaying === true) {
      return;
    }

    isPlaying = true;
    startTime = Tweenable.now() - (pausedAtTime - startTime);
    loop();
  }

  function init (containerId) {
    pausedAtTime = startTime = Tweenable.now();
    segmentContainer = document.getElementById(containerId);
    segments = segmentContainer.children;
    stepStateLists = [];

    for (i = 0; i < segments.length; i++) {
      stepStateLists.push([])
    }

    window.pause = pause;
    window.play = play;
  }

  global.shiftyDemo = global.shiftyDemo || {};

  Tweenable.shallowCopy(global.shiftyDemo, {
            'helixInit': init
            ,'helixPlay': play
            ,'helixPause': pause
        });
} (this));
