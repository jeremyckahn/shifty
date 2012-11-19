(function (global) {
  var me
    ,tweener
    ,originalColor
    ,originalFontSize;

  function getStyle (el, style) {
    var ret
      ,styleWords;

    if (window.getComputedStyle) {
      ret = window.getComputedStyle(el).getPropertyCSSValue(style).cssText;
    } else {
      // For IE
      styleWords = style.split('-');
      if (styleWords.length === 2) {
        // ugly!
        style = styleWords[0];
        style += styleWords[1].match(/^./)[0].toUpperCase();
        style += styleWords[1].split('').slice(1).join('');
      }

      ret = el.currentStyle[style];
    }

    return ret;
  }

  function grow (el, size, callback) {
    tweener.to({
      'to': {
        'font-size': size + 'px'
      }

      ,'duration': 600

      ,'easing': 'easeOutBounce'

      ,'step': function step () {
        el.style.fontSize = this['font-size'];
      }

      ,'callback': callback
    });
  }

  function fade (el, callback) {
    tweener.to({
      'to': {
        'color': '#333'
      }

      ,'duration': 800

      ,'easing': 'easeOutExpo'

      ,'step': function step () {
        el.style.color = this['color'];
      }

      ,'callback': callback
    });
  }

  function init (el) {
    originalFontSize = getStyle(el, 'font-size');
    originalColor = getStyle(el, 'color');

    tweener = new Tweenable({
      'initialState': {
        'font-size': originalFontSize
        ,'color': originalColor
      }

      ,'fps': 60
    });
  }

  global.shiftyDemo = global.shiftyDemo || {};

  Tweenable.shallowCopy(global.shiftyDemo, {
      'introInit': init
      ,'introGrow': grow
      ,'introFade': fade
  });

} (this));
