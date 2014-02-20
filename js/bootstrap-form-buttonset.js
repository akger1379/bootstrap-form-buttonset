/**
 * bootstrap-form-buttonset
 * Lightweight plugin to skin/transform radios and/or checkboxes into Bootstrap button groups.
 * @see https://github.com/akger1379/bootstrap-form-buttonset
 * @see https://gist.github.com/akger1379/8625327
 * Copyright (c) 2014, André Kroll
 * Released under the MIT license
 */
;
(function ($, window, document, undefined) {
	"use strict";

	var PLUGIN_NAME = 'bsFormButtonset';
	var PLUGIN_DEFAULTS = {
		buttonClasses: 'btn-default',
		isVertical: false,
		isOptional: false
	};

	function PLUGIN(element, options) {
		this._$element = $(element);
		this._options = this._validateOptions(options, PLUGIN_DEFAULTS);
		this._inputs = {};
	};

	PLUGIN.prototype = {

		// <PUBLIC_PLUGIN_LOGIC> .......................................................................................

		attach: function (options) {
			this.detach();
			this.setOptions(options);
			this._attachButtonGroupToInputs();
		},

		detach: function () {
			this._detachButtonGroupFromInputs();
		},

		refresh: function () {
			this._syncButtonStates();
		},

		setOptions: function(options) {
			this._options = this._validateOptions(options, this._options);
		},

		// <PRIVATE_PLUGIN_LOGIC> ......................................................................................

		_validateOptions: function (options, defaults) {
			return $.extend({}, defaults, options);
		},

		_attachButtonGroupToInputs: function () {
			var that = this;
			var $btnGroup = $('<div></div>');
			if (this._options.isVertical) {
				if (!isBootstrap3()) {
					$btnGroup.addClass('btn-group');
				}
				$btnGroup.addClass('btn-group-vertical');
			} else {
				$btnGroup.addClass('btn-group');
			}
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
						var canBeUnchecked = (inputType == 'checkbox' || that._options.isOptional);
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
						// fire change event
						that._inputs[inputId].$input.trigger('change');
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
		},

		_detachButtonGroupFromInputs: function () {
			if (this._options.isVertical) {
				this._$element.children('div.btn-group-vertical').remove();
			} else {
				this._$element.children('div.btn-group').remove();
			}
			this._$element.children('.bootstrap-form-buttonset-org').children().unwrap();
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

	// <PRIVATE_STATIC_HELPERS> ........................................................................................
	var _isBs3 = null;

	function isBootstrap3() {
		if (_isBs3 === null) {
			var test = $('<div class="bg-primary" style="display: none"></div>');
			test.appendTo('body'); // IE fix to read out css property
			if (test.css('background-color') == 'rgb(66, 139, 202)') {
				_isBs3 = true;
			} else {
				_isBs3 = false;
			}
			test.remove();
		}
		return _isBs3;
	}

	// <JPB_CORE> ......................................................................................................
	{
		// Register global access through window object for altering plugin defaults
		window[PLUGIN_NAME + '_defaults'] = PLUGIN_DEFAULTS;
		// Register the plugin at jQuerys function namespace
		$.fn[PLUGIN_NAME] = function () {
			var orgArgs = arguments;
			var constructOptions = {};
			var isMethodCall = false;
			var methodArgs = [];
			if (orgArgs[0] !== undefined && typeof orgArgs[0] === 'object') {
				constructOptions = orgArgs[0];
			} else if (typeof orgArgs[0] === 'string') {
				isMethodCall = true;
				methodArgs = Array.prototype.slice.call(orgArgs, 1)
			}
			this.each(function () {
				if (undefined === $.data(this, 'plugin_' + PLUGIN_NAME)) {
					// First call by this element: create new instance of the plugin
					$.data(this, 'plugin_' + PLUGIN_NAME, new PLUGIN(this, constructOptions));
				}
				if (isMethodCall === true) {
					$.data(this, 'plugin_' + PLUGIN_NAME)[orgArgs[0]].apply($.data(this, 'plugin_' + PLUGIN_NAME), methodArgs);
				}
			});
			return this;
		};
	}
})(jQuery, window, document);