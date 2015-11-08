#!/usr/bin/node
var debug = require('debug')('Option'),
	helpers = require('./Helpers'),

	//Error Types
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
 *  * [length] Number of values, how many values should follow the option.
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

	if (this.shortFlag != null && (this.shortFlag.length != 2 || this.shortFlag[0] !== '-')) {
		throw new InvalidInputError("The option: " + this.name + "'s short property must start with a '-' and be one more character.");
	}

	if (this.longFlag != null && (this.longFlag.length <= 2 || this.longFlag.substr(0, 2) !== '--')) {
		throw new InvalidInputError("The option: " + this.name + "'s long property must start with '--' and be one or more character");
	}

	if((this.shortFlag == null || this.shortFlag.length === 0) && (this.longFlag == null || this.longFlag.length === 0)) {
		throw new InvalidInputError("The option: " + this.name + "'s must have a shortFlag or longFlag property");
	}
}

/**
 * Validate Type
 *
 * Very simple validation for if something is a number or a string.
 * @param {*} value
 * @returns {boolean}
 */
Option.prototype.validateType = function (value) {
	switch (this.type.toLowerCase()) {
		case 'number':
		case 'integer':
		case 'int':
		case 'float':
		case 'double':
			var numberRegex = new RegExp(/[-+]?[0-9]*([\.,][0-9]+)?/);
			return numberRegex.test(value);
			break;
		case 'string':
		//Anything is a string
		default:
			return true;
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
				value;
			switch (option.length) {
				case 1:
				case true:
					//Just one
					debug("\t-Single mode");
					value = args[index + 1];
					if (!option.validateType(value.toString())) {
						throw new InvalidInputError("Option " + option.name + " had an invalid type: " + value + " wasn't of type " + option.type);
					}
					params[option.name] = value;
					args.splice(index, 2);
					break;
				case "+":
					//At least one
					debug("\t-At least one mode");
					params[option.name] = [];
					args.splice(index, 1);
					while (true) {
						if (args[index] && args[index][0] != '-') {
							value = args.splice(index, 1)[0];
							if (!option.validateType(value.toString())) {
								throw new InvalidInputError("Option " + option.name + " had an invalid type: " + value + " wasn't of type " + option.type);
							}
							debug("\t\t-Adding: " + value);
							params[option.name].push(value);
						}
						else {
							break;
						}
					}
					if (params[option.name].length === 0) {
						throw new Error("Option " + option.name + " ")
					}
					break;
				case 0:
				case "*":
					//Multiple
					debug("\t-Multiple mode " + option.length);
					params[option.name] = [];
					args.splice(index, 1);
					while (true) {
						debug("\t\t-Testing: " + args[index]);
						if (args[index] && args[index][0] != '-') {
							value = args.splice(index, 1)[0];
							if (!option.validateType(value.toString())) {
								throw new InvalidInputError("Option " + option.name + " had an invalid type: " + value + " wasn't of type " + option.type);
							}
							debug("\t\t\t-Adding: " + value);
							params[option.name].push(value);
						}
						else {
							break;
						}
					}
					break;
				default:
					//A fixed number
					debug("\t-Fixed mode");
					params[option.name] = [];
					args.shift();
					for (var i = 1; i <= option.length; i++) {
						if (args[0][0] != '-') {
							value = args.shift();
							if (!option.validateType(value.toString())) {
								throw new InvalidInputError("Option " + option.name + " had an invalid type: " + value + " wasn't of type " + option.type);
							}
							params[option.name].push(value);
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