#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter');

/**
 * Option
 *
 * Options are key/value pairs, e.g. -n myName. They can be in any order.
 *
 * @param {String} name The name of the option
 * @param {String} description Description of the option, used in help text and error messages.
 * @param {String} [short] Short version of Option, usually a "-" and a single character.
 * @param {String} [long] Long version of the Option, a "--" and multiple characters.
 * @param {String} [type]
 * @param {Number|String} [numValues] Number of values, how many values should follow the option. Can be 1 (default), any
 * integer, * (multiple), or + (at least 1)
 * @constructor
 */
function Option(name, description, short, long, type, numValues) {
	AbstractParameter.call(this, name, description);

	this.short = short;
	this.long = long;
	this.type = type;
	if(numValues === false || numValues == undefined) {
		this.numValues = 0
	}
	else if(numValues === true) {
		this.numValues = 1;
	}
	else {
		this.numValues = numValues;
	}
}

Option.prototype = Object.create(AbstractParameter.prototype);

/**
 * Validate Type
 *
 * Very simple validation for if something is a number or a string.
 * @param {*} value
 * @returns {boolean}
 */
Option.prototype.validateType = function(value) {
	switch(this.type) {
		case 'number':
		case 'double':
		case 'float':
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

module.exports = Option;