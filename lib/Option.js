#!/usr/bin/node
var debug = require('debug')('Option'),
	helpers = require('./Helpers'),

	//Error Types
	ConfigError = require('./error/config'),
	InvalidInputError = require('./error/invalid-input');

/**
 * Option
 *
 * Options are key/value pairs, e.g. -n myName. They can be in any order.
 *
 *  * name The name of the option
 *  * [description] Description of the option, used in help text and error messages.
 *  * short Short version of Option, usually a "-" and a single character.
 *  * [long] Long version of the Option, a "--" and multiple characters.
 *  * [type]
 *  * [length] Number of values, how many values should follow the option, -1 is unlimited
 *  * [required] If this option is required
 *
 * @param {{name, description, [shortFlag], [longFlag], [type], [length], [required]}} options
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
 * Validate Type
 *
 * Very simple validation for if something is a number or a string.
 * @param {*} value
 * @returns {Number|String}
 */
Option.prototype.validateType = function (value) {
	var numberRegex
	switch (this.type.toLowerCase()) {
		case 'integer':
		case 'int':
			numberRegex = new RegExp(/^[-+]?[0-9]+$/);
			if (numberRegex.test(value)) {
				return parseInt(value);
			}
			else {
				throw new InvalidInputError("Option with " + value + " wasn't of type " + this.type);
			}
			break;
		case 'number':
		case 'float':
		case 'double':
			numberRegex = new RegExp(/^[-+]?[0-9]*([\.,][0-9]+)?$/);
			if (numberRegex.test(value)) {
				return parseFloat(value);
			}
			else {
				throw new InvalidInputError("Option with " + value + " wasn't of type " + this.type);
			}
			break;
		case 'string':
			//Anything is a string
			return value;
		default:
			return value;
			break;
	}
};

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
					//Multiple
					debug("\t-Multiple mode " + option.length);
					params[option.name] = [];
					args.splice(index, 1);
					while (true) {
						debug("\t\t-Testing: " + args[index]);
						if (args[index] && args[index][0] != '-') {
							value = args.splice(index, 1)[0];
							parsedValue = option.validateType(value.toString());
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
					params[option.name] = option.validateType(value.toString());
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
							parsedValue = option.validateType(value.toString());
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
	}.bind(this));
	debug('Args after option: ' + JSON.stringify(args) + "\n");
	return params;
};

module.exports = Option;