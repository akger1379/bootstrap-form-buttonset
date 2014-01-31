/**
 * @see https://gist.github.com/akger1379/8625327
 */
;
(function ($, window, document, undefined) {
    "use strict";

    var PLUGIN_NAME = 'bsFormButtonset';
    var PLUGIN_DEFAULTS = {
        buttonClasses: ''
    };

    function PLUGIN(element, options) {
        this._$element = $(element);
        this._options = this._initOptions(options);

        // Inputs initialisieren und Typ bestimmen (Radio oder Checkbox)
        this._inputs = {};

        this._isAttached = false;
    };

    PLUGIN.prototype = {

        // <PUBLIC_PLUGIN_LOGIC> .......................................................................................

        attach: function () {
            this._attach();
        },

        detach: function () {
            this._detach();
        },

        // <PRIVATE_PLUGIN_LOGIC> ......................................................................................

        _initOptions: function (options) {
            return $.extend({}, PLUGIN_DEFAULTS, options);
        },

        _attach: function() {
            if (this._isAttached) {
                return;
            }

            var that = this;
            this._$element.children('input[type=radio], input[type=checkbox]').each(function () {
                var $this = $(this);
                var id = $this.attr('id');
                if (id == '') {
                    throw 'Input elements need to have an ID attribute.'
                }
                that._inputs[id] = {
                    $elem: $this,
                    type: $this.attr('type'),
                    name: $this.attr('type'),
                    label: that._$element.find('label[for="' + id + '"]').html()
                };
            });

            // Button-Gruppe generieren
            var $btnGroup = $('<div class="btn-group">');
            for (var id in this._inputs) {
                var $btn = $('<button class="btn">');
                $btn.attr('data-input-id', id);
                $btn.addClass(this._options.buttonClasses);
                $btn.html(this._inputs[id].label);
                $btn.appendTo($btnGroup);
            }

            // Button-Gruppe darstellen
            this._$element.wrapInner('<div class="bootstrap-form-buttonset-org" style="display:none">');
            this._$element.append($btnGroup);

            // Button-Zustände snycen
            this._syncButtonStates();

            // Button-Events definieren
            this._$element.children('.btn-group').children('button').on('click', function (e) {
                var $btn = $(this);
                var id = $btn.attr('data-input-id');
                if (!that._inputs[id].$elem.prop('disabled')) {
                    if ($btn.hasClass('active')) {
                        that._inputs[id].$elem.prop('checked', false);
                    } else {
                        if (that._inputs[id].type == 'radio') {
                            // Alle zugehörigen Inputs unchecken
                            for (var tmpId in that._inputs) {
                                if (that._inputs[id].name == that._inputs[tmpId].name) {
                                    that._inputs[tmpId].$elem.prop('checked', false);
                                }
                            }
                        }
                        that._inputs[id].$elem.prop('checked', true);
                    }
                    that._syncButtonStates();
                }
                e.target.blur();
                e.preventDefault();
            });

            // set plugin state
            this._isAttached = true;
        },

        _detach: function () {
            if (!this._isAttached) {
                return;
            }
            this._$element.children('div.btn-group').remove();
            this._$element.children('.bootstrap-form-buttonset-org').children().unwrap();

            // set plugin state
            this._isAttached = false;
        },

        _syncButtonStates: function () {
            var that = this;
            this._$element.children('.btn-group').children('button').each(function () {
                var $btn = $(this);
                var id = $btn.attr('data-input-id');
                $btn.removeClass('active');
                if (that._inputs[id].$elem.prop('disabled')) {
                    $btn.addClass('disabled');
                } else {
                    if (that._inputs[id].$elem.prop('checked')) {
                        $btn.addClass('active');
                    }
                }
            });
        }

    };

    // <PRIVATE_STATIC_HELPERS> ........................................................................................
    function log(varToLog) {
        if (window.console && window.console.log) {
            window.console.log(varToLog);
        }
    }

    // <JPB_CORE> ......................................................................................................
    {
        // Register global access through window object for altering plugin defaults
        window[PLUGIN_NAME + '_defaults'] = PLUGIN_DEFAULTS;
        // Register the plugin at jQuerys function namespace
        $.fn[PLUGIN_NAME] = function (options) {
            this.each(function () {
                if (undefined === $.data(this, 'plugin_' + PLUGIN_NAME)) {
                    // First call by this element: create new instance of the plugin
                    $.data(this, 'plugin_' + PLUGIN_NAME, new PLUGIN(this, options));
                }
            });
            return (this.length > 0) ? $.data(this.get(0), "plugin_" + PLUGIN_NAME) : this;
        };
    }
})(jQuery, window, document);