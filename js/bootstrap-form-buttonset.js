/**
 * @see https://gist.github.com/akger1379/8625327
 */
;
(function ($, window, document, undefined) {
	"use strict";

	var PLUGIN_NAME = 'bsFormButtonset';
	var PLUGIN_DEFAULTS = {
		buttonClasses: '',
		optional: false
	};

	function PLUGIN(element, options) {
		this._$element = $(element);
		this._options = this._initOptions(options);
		this._isAttached = false;
		this._inputs = {};
	};

	PLUGIN.prototype = {

		// <PUBLIC_PLUGIN_LOGIC> .......................................................................................

		attach: function () {
			this._attachButtonGroupToInputs();
		},

		detach: function () {
			this._detachButtonGroupFromInputs();
		},

		refresh: function () {
			this._syncButtonStates();
		},

		// <PRIVATE_PLUGIN_LOGIC> ......................................................................................

		_initOptions: function (options) {
			return $.extend({}, PLUGIN_DEFAULTS, options);
		},

		_attachButtonGroupToInputs: function () {
			if (this._isAttached) {
				return;
			}

			var that = this;
			var $btnGroup = $('<div class="btn-group"></div>');
			this._$element.children('input[type=radio], input[type=checkbox]').each(function () {
				var $input = $(this);
				var id = $input.attr('id');
				if (id == '') {
					throw 'Input elements need to have a valid ID.'
				}
				// generate button for input element
				var $btn = $('<button class="btn"></button>');
				$btn.attr('data-input-id', id);
				$btn.addClass(that._options.buttonClasses);
				$btn.html(that._$element.find('label[for="' + id + '"]').html());
				$btn.appendTo($btnGroup);
				// define click event
				$btn.on('click', function (e) {
					var $clickedBtn = $(this);
					var inputId = $clickedBtn.attr('data-input-id');
					var inputType = that._inputs[inputId].$input.attr('type');
					// act only when not disabled
					if (!that._inputs[inputId].$input.prop('disabled')) {
						var canBeUnchecked = (inputType == 'checkbox' || that._options.optional);
						if ($clickedBtn.hasClass('active')) {
							if (canBeUnchecked) {
								that._inputs[inputId].$input.prop('checked', false);
								that._inputs[inputId].$btn.removeClass('active');
							}
						} else {
							if (inputType == 'radio') {
								// un-check all relating radio inputs
								for (var relId in that._inputs) {
									if (that._inputs[inputId].name == that._inputs[relId].name) {
										that._inputs[relId].$input.prop('checked', false);
										that._inputs[relId].$btn.removeClass('active');
									}
								}
							}
							that._inputs[inputId].$input.prop('checked', true);
							that._inputs[inputId].$btn.addClass('active');
						}
					}
					e.target.blur();
					e.preventDefault();
				});
				// save important references for later access
				that._inputs[id] = {
					$input: $input,
					$btn: $btn,
					name: $input.attr('name')
				};
			});

			// hide input elements and show button group
			this._$element.wrapInner('<div class="bootstrap-form-buttonset-org" style="display:none"></div>');
			this._$element.append($btnGroup);

			// sync button states with current input states
			this._syncButtonStates();

			// set plugin state
			this._isAttached = true;
		},

		_detachButtonGroupFromInputs: function () {
			if (!this._isAttached) {
				return;
			}
			this._$element.children('div.btn-group').remove();
			this._$element.children('.bootstrap-form-buttonset-org').children().unwrap();
			this._isAttached = false;
		},

		_syncButtonStates: function () {
			var that = this;
			this._$element.children('.btn-group').children('button').each(function () {
				var $btn = $(this);
				var id = $btn.attr('data-input-id');
				if (that._inputs[id].$input.prop('disabled')) {
					$btn.addClass('disabled');
				}
				if (that._inputs[id].$input.prop('checked')) {
					$btn.addClass('active');
				} else {
					$btn.removeClass('active');
				}
			});
		}

	};

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