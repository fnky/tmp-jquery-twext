/*
 *  jquery-twext - v3.5.0
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by 
 *  Under MIT License
 */
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
          0: 'twext-length-normal',   // 0 or greater
          5: 'twext-length-medium',  // 80 or greater
          10: 'twext-length-high'    // 140 or greater
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

      console.log(parseText('%length HELLO %max', {
        length: 12,
        max: function () { return 'Juvel'; }
      }))
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
     * @param  {[type]}   length        [description]
     * @param  {[type]}   lengthClasses [description]
     * @param  {Function} cb            [description]
     * @return {[type]}                 [description]
     */
    function getClassFromLength(length, lengthClasses, cb) {
      var current = lengthClasses[length];

      if (current) {
        cb(current);
      }
    }

    /**
     * Callback to handle events on a input
     * @param  {object} e The event object
     */
    function onChange(e) {
      var $element = $(e.target);
      var value = $element.val();

      getClassFromLength(
        value.length,
        settings.classes, function (cl) {
          $element.addClass(cl);
      });

      // update the label
      settings.lengthElement.html(parseText(settings.lengthFormat, {
        length: value.length,
        maxLength: settings.maxLength
      }).formatted);

      //$element.addClass();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
          var $element = $(this.element);
          $element.on('keydown keyup', onChange);
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
