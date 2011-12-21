/**
Shifty CSS Unit Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.css_units.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function shiftyCSSUnits () {

  var R_CSS_UNITS = /(px|em|%|pc|pt|mm|cm|in|ex)/i,
    R_QUICK_CSS_UNITS = /([a-z]|%)/gi,
    savedTokenProps;
  
  function isValidString (str) {
    return typeof str === 'string' && R_CSS_UNITS.test(str);
  }
  
  function getTokenProps (obj) {
    var collection;

    collection = {};
    
    Tweenable.util.each(obj, function (obj, prop) {
      if (isValidString(obj[prop])) {
        collection[prop] = {
          'suffix': obj[prop].match(R_CSS_UNITS)[0]
        };
      }
    });
    
    return collection;
  }
  
  function deTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      // Extract the value from the string
      obj[token] = +(obj[token].replace(R_QUICK_CSS_UNITS, ''));
    });
  }
  
  function reTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      obj[token] = obj[token] + collection[token].suffix;
    });
  }
  
  Tweenable.prototype.filter.token = {
    'beforeTween': function beforeTween (currentState, fromState, toState) {
      savedTokenProps = getTokenProps(fromState);
      
      deTokenize(currentState, savedTokenProps);
      deTokenize(fromState, savedTokenProps);
      deTokenize(toState, savedTokenProps);
    },
    
    'afterTween': function afterTween (currentState, fromState, toState) {
      reTokenize(currentState, savedTokenProps);
      reTokenize(fromState, savedTokenProps);
      reTokenize(toState, savedTokenProps);
    }
  };
  
}());
