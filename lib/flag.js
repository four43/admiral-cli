#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter'),
	InvalidInputError = require('./error/invalid-input');

/**
 * Flag
 *
 * A flag is a single phrase that is set as a boolean. Flags that aren't passed are set as false.
 * @param {String} name Name of the flag, it will be stored as cli.params.[name]
 * @param {String} [description] Description of the flag. Used in help text.
 * @param {String} short Short version of the flag, starts with '-' and is one more character.
 * @param {String} long The long version of the flag, starts with '--' and is one or more characters.
 * @constructor
 */
function Flag(name, description, short, long) {
	AbstractParameter.call(this, name, description);

	this.short = short;
	if(this.short.length != 2 && this.short[0] === '-') {
		throw new InvalidInputError("The flag: " + name + "'s short property must start with a '-' and be one more character.");
	}

	this.long = long;
	if(this.long.length <= 2 && this.long.substr(0,2) === '--') {
		throw new InvalidInputError("The flag: " + name + "'s long property must start with '--' and be one or more character");
	}
}
Flag.prototype = Object.create(AbstractParameter.prototype);

module.exports = Flag;