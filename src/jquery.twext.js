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

    var cr = 0;
    function getClassFromLength(length, lengthClasses, cb) {
      var className = check(lengthClasses[length], lengthClasses);

      var nextOrPrev = (className.next || className.prev);

      return cb(className);

      if (cr && !nextOrPrev) {
        console.log('neither', cr);
        return cb(cr);
      } else if (className.next) {
        console.log('next undefined');
        cr = lengthClasses[length];
      } else if (className.prev) {
        console.log('prev undefined');
        cr = lengthClasses[length];
      }

      return cb(cr);



      // // get the class from lengthClasses based on the length (key)
      // var current = lengthClasses[length];
      // var next = lengthClasses[length + 1];

      // var lengthKeys = Object.keys(lengthClasses);

      // // whenever we have found a class, we cache it (cr)
      // if (length === 1 && lengthKeys.indexOf(length) === -1) {
      //   console.log('edge case', lengthClasses[lengthKeys[0]]);
      //   cr = 0;
      //   return cb(lengthClasses[lengthKeys[0]]);
      // } else if (length === 1 && lengthKeys.indexOf(length) !== -1) {
      //   return cb(lengthClasses[lengthKeys[1]]);
      // }

      // if (current) {
      //   cr = current;
      // } else {
      //   if (next) {
      //     // reached new class going down
      //   }
      // }
      // *
      //  * if length doesn't match to a class
      //  *   if length + 1 matches we've reached a new class going down
      //  * if length matches we've reached a new class going up


      // var next = (length > 0) ? length + 1 : 0;
      // var nextIndex = lengthKeys.indexOf(next.toString());

      // console.log('---------');
      // console.log("nextIndex:", nextIndex);
      // console.log("values of lClasses:", getValuesOfObject(lengthClasses))

      // var prevIndex = lengthKeys.indexOf(length.toString());

      // if (nextIndex < 0 && prevIndex !== -1) {
      //   return cb(lengthClasses[lengthKeys[prevIndex]]);
      // }

      // if (nextIndex === 1 && prevIndex === -1) {
      //   var nextClass = lengthClasses[lengthKeys[nextIndex]];
      //   if (nextClass && nextIndex - 1 === length) {
      //     return cb(nextClass);
      //   }
      // }

      // console.log('previous', prevIndex);

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
          $element.on('keyup', onChange);
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
