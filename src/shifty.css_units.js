/**
Shifty CSS Unit Extension
By Jeremy Kahn - jeremyckahn@gmail.com
  v0.1.0

For instructions on how to use Shifty, please consult the README: https://github.com/jeremyckahn/shifty/blob/master/README.md
For instructions on how to use this extension, please see: https://github.com/jeremyckahn/shifty/blob/master/doc/shifty.css_units.md

MIT Lincense.  This code free to use, modify, distribute and enjoy.

*/

(function () {

    var R_FORMAT = /\D+/g;
    var savedTokenProps;

  function isValidString (str) {
    return typeof str === 'string' && str.match(R_FORMAT);
  }

  function getTokenProps (obj) {
    var collection;

    collection = {};

    Tweenable.util.each(obj, function (obj, prop) {
      var rawString = obj[prop];

      if (isValidString(rawString)) {
        var templateChunks = rawString.match(R_FORMAT);

        if (templateChunks.length === 1) {
          templateChunks.unshift('');
        }

        collection[prop] = templateChunks;
      }
    });

    return collection;
  }

  function deTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      // Extract the value from the string
      obj[token] = +(obj[token].replace(R_FORMAT, ''));
    });
  }

  function reTokenize (obj, tokenProps) {
    Tweenable.util.each(tokenProps, function (collection, token) {
      var tokenChunks = collection[token];
      obj[token] = tokenChunks[0] + obj[token] + tokenChunks[1];
    });
  }

  Tweenable.prototype.filter.token = {
    'beforeTween': function (currentState, fromState, toState) {
      savedTokenProps = getTokenProps(fromState);

      deTokenize(currentState, savedTokenProps);
      deTokenize(fromState, savedTokenProps);
      deTokenize(toState, savedTokenProps);
    },

    'afterTween': function (currentState, fromState, toState) {
      reTokenize(currentState, savedTokenProps);
      reTokenize(fromState, savedTokenProps);
      reTokenize(toState, savedTokenProps);
    }
  };

}());
