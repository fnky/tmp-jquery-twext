// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

  "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'twext';
    var defaults = {
        maxLength: 140,
        classes: {
          0: 'twext-length-normal',         // 0 or greater
          5: 'twext-length-medium',         // 80 or greater
          10: 'twext-length-high'           // 140 or greater
        },
        lengthElement: $('.twext-length-label'),
        lengthFormat: '%length characters of %maxLength'
    };
    var settings = {};

    // The actual plugin constructor
    function Plugin (element, options) {
      this.element = element;
      // jQuery has an extend method which merges the contents of two or
      // more objects, storing the result in the first object. The first object
      // is generally empty as we don't want to alter the default options for
      // future instances of the plugin
      this.settings = $.extend( {}, defaults, options );
      settings = this.settings;
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
    }


    function parseText(str, obj) {
      var keys = Object.keys(obj);
      var _ret = {};

      var formatted = str;

      _ret.original = str;

      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        var value = obj[key];
        var propertyRegex = new RegExp('(\%' + key + ')', 'g');

        if (typeof value === 'function') {
          value = value();
        }

        formatted = formatted.replace(propertyRegex, value.toString());
      }

      _ret.formatted = formatted;

      return _ret;
    }

    /**
     * Gets classes based on the length of
     * @param  {Number}   length        The length of the string
     * @param  {Object}   lengthClasses The object of classes based on length
     * @param  {Function} cb            The callback
     */

    // Contributed by Herkii (@herkii herkii@gmail.com)
    function check(tr, cl) {
        var _n = Object.keys(cl)[tr + 1];
        var _p = Object.keys(cl)[tr - 1]
        if(!_p) { _p = Object.keys(cl)[tr] };
        if(!_n) { _n = Object.keys(cl)[tr] };
        return { prev: _p, next: _n };
    }

    var current;
    var next;
    var prev;
    function getClassFromLength(length, lengthClasses, cb) {
      var lengthClassesKeys = Object.keys(lengthClasses);

      if (!current) {
        for (var i = 1; i < lengthClassesKeys.length - 1; ++i) {
          var c1 = lengthClassesKeys[i - 1];
          var c2 = lengthClassesKeys[i];
          if (length >= c1 && length < c2) {
            current = parseInt(c1);
            prev = i > 1 ? parseInt(lengthClassesKeys[i - 1]) : current;
            next = parseInt(c2);

            return cb(lengthClasses[current.toString()]);
          }
        }
      }

      if (length < parseInt(current)) {
        next = current;
        current = prev;
        var prevIdx = lengthClassesKeys.indexOf(prev.toString());
        prev = lengthClassesKeys[Math.max(prevIdx - 1, 0)];
      } else if (length >= next) {
        while (length >= next && next !== current) {
          prev = current;
          current = next;
          var nextIdx = lengthClassesKeys.indexOf(next.toString());
          next = lengthClassesKeys[Math.min(nextIdx + 1, lengthClassesKeys.length - 1)];
        }
      }
      return cb(lengthClasses[current.toString()]);
    }

    function getValuesOfObject(obj) {
      var keys = Object.keys(obj);
      var _ret = [];

      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        var value = obj[key];

        if (obj.hasOwnProperty(key)) {
          _ret.push(value);
        }
      }

      return _ret;
    }

    /**
     * Callback to handle events on a input
     * @param  {object} e The event object
     */
    function onChange(e) {
      var $element = $(e.target);
      var value = $element.val();

      var classes = getValuesOfObject(settings.classes);

      getClassFromLength(value.length, settings.classes, function (cl) {
          $element.removeClass(classes.join(' ')).addClass(cl);
      });

      // update the label
      settings.lengthElement.html(parseText(settings.lengthFormat, {
        length: value.length,
        maxLength: settings.maxLength
      }).formatted);
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
          var $element = $(this.element);
          $element.on('keydown keyup input propertychange', onChange);
        },

        onKeyUp: function () {
            // some logic
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );
