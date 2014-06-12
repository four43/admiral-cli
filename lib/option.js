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
 * @constructor
 */
function Option(name, description, short, long, type, required) {
	AbstractParameter.call(this, name, description);

	this.short = short;
	this.long = long;
	this.type = type;
	this.required = required || false;
}
Option.prototype = Object.create(AbstractParameter.prototype);

module.exports = Option;