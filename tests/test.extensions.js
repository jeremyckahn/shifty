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
  

  function simpleTestTween (inst, step, callback) {
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
  }
  

  test('shifty.queue.js', function () {
    var inst
        ,queuedTween1Run
        ,queuedTween2Run
        ,queuedTween3Run;

    inst = getTestInst();

    inst.queue(START_TEST_VAL, END_TEST_VAL, QUICK_TEST_DURATION, function () {
      queuedTween1Run = true;
    });

    inst.queue(START_TEST_VAL, END_TEST_VAL, QUICK_TEST_DURATION, function () {
      queuedTween2Run = true;
    });

    inst.queue(START_TEST_VAL, END_TEST_VAL, QUICK_TEST_DURATION, function () {
      queuedTween3Run = true;
      ok(true === queuedTween1Run
        && true === queuedTween2Run
        && true === queuedTween3Run,
        'All three queue tweens were run.')
      
      start();
    });
    
    stop();
  });
}
