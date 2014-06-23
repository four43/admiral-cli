#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter'),
	Command = require('./command'),
	ConfigError = require('./error/config');

/**
 * Command Group
 *
 * A container that holds commands. One command can be chosen by the user at a time, per Command Group.
 *
 * @param {String} name The name of the command
 * @param {String} [description] Description of the command, used in help text and error messages.
 * @param {Command[]} commands An array of commands to use for this group.
 * @param {Function} [callback] function(cliInstance, command), A function that is called when this command is used.
 * @constructor
 */
function CommandGroup(name, description, commands, callback, required) {
	AbstractParameter.call(this, name, description);
	this.commands = [];
	this.callback = callback;
	this.required = required;

	commands.forEach(function (command) {
		if (command instanceof Command) {
			//Commands are Command objects
			this.commands.push(command);
		}
		else if (command instanceof Array) {
			//Commands are arrays
			this.commands.push(new Command(command[0], command[1], command[2], command[3]));
		}
		else {
			throw new ConfigError("Command: " + command + " of group " + name + " was configured wrong, must be Array or Command object");
		}
	}.bind(this));
}

module.exports = CommandGroup;