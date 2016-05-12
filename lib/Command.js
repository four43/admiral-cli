#!/usr/bin/node

/**
 * Command
 *
 * A command is a string, usually one of multiple, used for routing. Much like an API endpoint.
 * Commands are grouped, so you can validate against multiple sets.
 *
 * @param {{}} options
 * @param {string} options.name The name of the command
 * @param {string} options.description Description of the command, used in help text and error messages.
 * @param {function} [options.callback[ function(cliInstance, command), A function that is called when this command is used.
 * @param {[]} [options.subElements] The subElements to considered only when parsing this command.
 * @constructor
 */
function Command(options) {
	this.name = options.name;
	this.description = options.description;
	this.callback = options.callback;

	this.subElements = options.subElements || [];
}

module.exports = Command;