function runExtensionTests () {
  module('Extension tests');

  var quickTestDuration
      ,QUICK_TEST_DURATION = 250
      ,START_TEST_VAL = 0
      ,END_TEST_VAL = 10;
  
  function getTestInst () {
    var inst;

    inst = new Tweenable();

    return inst;
  }
  

  /*function simpleTestTween (inst, step, callback) {
    inst.tween({
      'from': {
        'testVal': START_TEST_VAL
      }
      ,'to': {
        'testVal': END_TEST_VAL
      }
      ,'duration': QUICK_TEST_DURATION
      ,'step': function () {
        
        // Faking the context of the `step` call
        step.call(inst._state.current);

        return inst;
      } 
      ,'callback': callback
    });
  }*/
  

  test('shifty.queue.js', function () {
    var inst
        ,queuedTweenList
        ,startedTweensList;

    inst = getTestInst();
    queuedTweenList = [];
    startedTweensList = [];

    inst.queue({
      'from': START_TEST_VAL
      ,'to': END_TEST_VAL
      ,'duration': QUICK_TEST_DURATION
      ,'start': function () {
        startedTweensList[0] = true;
      }
      ,'callback': function () {
        queuedTweenList[0] = true;
      }
    });

    inst.queue({
      'from': START_TEST_VAL
      ,'to': END_TEST_VAL
      ,'duration': QUICK_TEST_DURATION
      ,'start': function () {
        if (startedTweensList[0] === true) {
          startedTweensList[1] = true;
        }
      }
      ,'callback': function () {
        
        if (queuedTweenList[0] === true) {
          queuedTweenList[1] = true;
        }
      }
    });

    inst.queue({
      'from': START_TEST_VAL
      ,'to': END_TEST_VAL
      ,'duration': QUICK_TEST_DURATION
      ,'start': function () {
        if (startedTweensList[1] === true) {
          startedTweensList[2] = true;
        }
      }
      ,'callback': function () {
        
        if (queuedTweenList[1] === true) {
          queuedTweenList[2] = true;
        }

        ok(true === queuedTweenList[0]
          && true === queuedTweenList[1]
          && true === queuedTweenList[2],
          'All three queue tweens were run in order.');
          
        ok(true === startedTweensList[0]
          && true === startedTweensList[1]
          && true === startedTweensList[2],
          'All three queued tweens ended before the next one began.');
          
        start();
      }
    });

    stop();
  });
}
