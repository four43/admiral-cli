#!/usr/bin/node
var debug = require('debug')('Option'),
	helpers = require('./helpers'),

	//Error Types
	ConfigError = require('./error/config'),
	InvalidInputError = require('./error/invalid-input');

/**
 * Option
 *
 * Options are key/value pairs, e.g. -n myName. They can be in any order.
 *
 * @param {{}} options
 * @param {string} options.name - The name of the option
 * @param {string} [options.description] - Description of the option, used in help text and error messages.
 * @param {string} options.short - Short version of Option, usually a "-" and a single character.
 * @param {string} [options.long] - Long version of the Option, a "--" and multiple characters.
 * @param {string} [options.type] -
 * @param {string} [options.length] - Number of values, how many values should follow the option, -1 is unlimited
 * @param {string} [options.required] - If this option is required
 * @param {string} [options.default] - The default value if this value isn't passed.
 *
 * @constructor
 */
function Option(options) {
	if (options === undefined) {
		options = {};
	}
	this.name = options.name;
	this.description = options.description;
	this.shortFlag = options.shortFlag;
	this.longFlag = options.longFlag;
	this.type = options.type || 'string';
	this.length = (options.length !== undefined) ? options.length : 1;
	this.required = (options.required !== undefined) ? options.required : true;
	this.default = options.default;

	if(this.length === 0) {
		throw new ConfigError("A length of 0 doesn't make sense for an option, use a flag instead or set required to false. Option " + this.name);
	}
	if (this.shortFlag != null && (this.shortFlag.length != 2 || this.shortFlag[0] !== '-')) {
		throw new InvalidInputError("The option: " + this.name + "'s short property must start with a '-' and be one more character.");
	}

	if (this.longFlag != null && (this.longFlag.length <= 2 || this.longFlag.substr(0, 2) !== '--')) {
		throw new InvalidInputError("The option: " + this.name + "'s long property must start with '--' and be one or more character");
	}

	if ((this.shortFlag == null || this.shortFlag.length === 0) && (this.longFlag == null || this.longFlag.length === 0)) {
		throw new InvalidInputError("The option: " + this.name + "'s must have a shortFlag or longFlag property");
	}
}

/**
 * @param {Array} args
 * @param {Option[]} options
 * @type {Function}
 */
Option.parse = function (args, options) {
	var params = {};
	options.forEach(function (option) {
		debug('Testing option: ' + option.shortFlag, args);
		var optionIndex = args.indexOf(option.shortFlag);
		var optionLongIndex = args.indexOf(option.longFlag);
		if (optionIndex !== -1 || optionLongIndex !== -1) {
			var index = (optionIndex !== -1) ? optionIndex : optionLongIndex,
				value,
				parsedValue;
			switch (option.length) {
				case -1:
					//Multiple / Any number
					debug("\t-Multiple mode " + option.length);
					params[option.name] = [];
					args.splice(index, 1);
					while (true) {
						debug("\t\t-Testing: " + args[index]);
						if (args[index] && args[index][0] != '-') {
							value = args.splice(index, 1)[0];
							parsedValue = helpers.validateType(option.type, value.toString());
							debug("\t\t\t-Adding: " + parsedValue);
							params[option.name].push(parsedValue);
						}
						else {
							break;
						}
					}
					if(option.required && params[option.name].length === 0) {
						throw new InvalidInputError('Option ' + option.name + ' requires at least one argument.');
					}
					break;
				case 1:
					//Just one
					debug("\t-Single mode");
					value = args[index + 1];
					params[option.name] = helpers.validateType(option.type, value.toString());
					args.splice(index, 2);
					break;
				default:
					//A fixed number, will return an array of values
					debug("\t-Fixed mode");
					params[option.name] = [];
					args.shift();
					for (var i = 1; i <= option.length; i++) {
						if (args && args[0] && args[0][0] != '-') {
							value = args.shift();
							parsedValue = helpers.validateType(option.type, value.toString());
							params[option.name].push(parsedValue);
						}
						else {
							throw new InvalidInputError('Option ' + option.name + ' requires ' + option.length + ' but stopped at ' + args[index + i]);
						}
					}
			}
			if (params[option.name] instanceof Array && params[option.name].length === 0) {
				params[option.name] = null;
			}
		}
		else if (option.required) {
			debug("Option " + option.shortFlag + "/" + option.longFlag + " not found");
			throw new InvalidInputError(option.shortFlag + "/" + option.longFlag + " is required, and wasn't found");
		}
		else {
			// No args matched, set the default.
			params[option.name] = option.default;
		}
	}.bind(this));
	debug('Args after option: ' + JSON.stringify(args) + "\n");
	return params;
};

module.exports = Option;