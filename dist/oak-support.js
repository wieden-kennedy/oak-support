// Bind polyfil
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

(function (o) {
    "use strict";

    var support, 
        animEvents = {'animation': 'animationend', '-moz-animation': 'animationend', '-webkit-animation': 'webkitAnimationEnd'},
        prefixes = ['Moz', 'Webkit', 'O', 'ms'],
        numPrefixes = prefixes.length,
        style = (document.body || document.documentElement).style,
        that = {};

    function getProp(prop) {
        var i, cased, styleProp;
        if (prop in style) {
            return normalize(prop);
        }
        cased = prop.charAt(0).toUpperCase() + prop.substr(1); 
        for (i = 0; i < numPrefixes; i += 1) {
           styleProp = prefixes[i] + cased; 
           if (styleProp in style) {
               return normalize(styleProp);
           }
        }
    }

    function isIE() {
        return (navigator.appVersion.indexOf("MSIE") !== -1) ? true : false;
    }

    function isIEVersion(ver) {
        var version;
        if (that.ie === true) {
            version = parseFloat(navigator.appVersion.split("MSIE")[1]);
        }
        return version === ver;
    }

    function isTouch() {
        if(("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch || window.navigator.msMaxTouchPoints) {
            return true;
        }
        return false;
    }

    // Normalizes the style properties for css declartions (E.g. WebkiteTransition -> -webkit-transition)
    function normalize(str) {
        return str.replace(/([A-Z])/g, function(i) { return '-' + i.toLowerCase(); });
    }

    function orientationEvent() {
      if (window.DeviceOrientationEvent) {
        return 'deviceOrientation';
      } else if (window.orientationEvent) {
        return 'MozOrientation';
      }
    }

    // oak.support.deviceBackingRatio
    // ----------------------
    // backingStorePixel to devicePixel ratio
    function dbRatio() {
        if (support.canvas === false) {
            return 1;
        }

        var ctx = that._dummyCtx,
            devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                                ctx.mozBackingStorePixelRatio ||
                                ctx.msBackingStorePixelRatio ||
                                ctx.oBackingStorePixelRatio ||
                                ctx.backingStorePixelRatio || 1;
        return devicePixelRatio/backingStoreRatio;
    }

    support = {
        animation: getProp('animation'),
        animationDelay: getProp('animationDelay'),
        animationDirection: getProp('animationDirection'),
        animationDuration: getProp('animationDuration'),
        animationFillMode: getProp('animationFillMode'),
        animationIterationCount: getProp('animationIterationCount'),
        animationName: getProp('animationName'),
        animationPlayState: getProp('animationPlayState'),
        animationTimingFunction: getProp('animationTimingFunction'),
        ie: isIE(),
        isIEVersion: isIEVersion,
        isTouch: isTouch(), 
        deviceMotion: (window.DeviceMotionEvent) ? true : false,
        orientation: (window.DeviceOrientationEvent || window.OrientationEvent) ? true : false,
        orientationEvent: orientationEvent(),
        getProp: getProp,
        perspective: getProp('perspective'),
        perspectiveOrigin: getProp('perspective-origin'),
        // oak.support.pixelRatio
        // ----------------------
        // equivelant of window.devicePixelRatio with value set to 1
        // for non-supporting browsers.
        pixelRatio: window.devicePixelRatio || 1,
        prefixes: prefixes,
        transition: getProp('transition'),
        transitionDelay: getProp('transitionDelay'),
        transitionDuration: getProp('transitionDuration'),
        transitionProperty: getProp('transitionProperty'),
        transitionTimingFunction: getProp('transitionTimingFunction'),
        transform: getProp('transform')
    };

    that._dummyCanvas = document.createElement("canvas");
    if (typeof that._dummyCanvas !== "undefined" && that._dummyCanvas.getContext) {
      that._dummyCtx = that._dummyCanvas.getContext("2d");
    }

    support.animationEnd = animEvents[support.animation];
    support.canvas = o.defined(that._dummyCtx);
    support.cssanimations = (typeof support.animation === "undefined") ? false : true;
    support.csstransitions = (typeof support.transition === "undefined") ? false : true;

    var name,
        transWindowMap = {
          'ontransitionend': 'transitionend',
          'onotransitionend': 'oTransitionEnd',
          'onwebkittransitionend': 'webkitTransitionEnd'
        },
        transPropMap = {
          'transition': 'transitionend',
          '-moz-transition': 'transitionend',
          '-o-transition': 'oTransitionEnd',
          '-webkit-transition': 'webkitTransitionEnd',
          '-ms-transition': 'MSTransitionEnd'
        };

    // Defined the transition end event.
    // Most browser define the event properly as a property of the window.
    for (name in transWindowMap) { 
      if (name in window) {
        support.transitionEnd = transWindowMap[name];
        break;
      }
    }
    // If still not defined, we'll attempt with a different method.
    // This is because firefox does not show the event as a property of the window.
    if (typeof support.transitionEnd === "undefined") {
      support.transitionEnd = transPropMap[support.transition];
    }

    support.deviceBackingRatio = dbRatio();
    that.support = support;

    o.core.extend(that);
}(oak));

(function (o) {
  "use strict";

  var self = {},
      _caf, 
      _lastTime = 0,
      _prefixes = o.support.prefixes,
      _raf;
  
  if (window.requestAnimationFrame) {
    _raf = window.requestAnimationFrame;
  } else {
    for(var i = 0; i < _prefixes.length && !self.requestAnimationFrame; i += 1) {
      _raf = window[_prefixes[i] + "RequestAnimationFrame"];
      _caf = window[_prefixes[i] + "CancelAnimationFrame"] || 
             window[_prefixes[i] + "CancelRequestAnimationFrame"];
    }
  }

  if (_caf) {
    self.caf = function () {
      _caf.apply(window, arguments);
    };
  } else {
    self.caf = function(id) {
      clearTimeout(id);
    };
  }

  if (_raf) {
    self.raf = function () {
      _raf.apply(window, arguments);
    };
  } else {
    self.raf = function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - _lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      _lastTime = currTime + timeToCall;
      return id;
    };
  }

  o.core.extend(self);

}(oak));
