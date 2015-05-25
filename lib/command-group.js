#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter'),
	Command = require('./command'),
    debug = require('debug')('CommandGroup'),
    helpers = require('./helpers'),
    util = require('util'),

    ConfigError = require('./error/config'),
    InvalidInputError = require('./error/invalid-input');

/**
 * Command Group
 *
 * A container that holds commands. One command can be chosen by the user at a time, per Command Group.
 *
 * Options:
 *
 *  * name The name of the command
 *  * [description] Description of the command, used in help text and error messages.
 *  * commands An array of commands to use for this group.
 *  * [callback] function(cliInstance, command), A function that is called when this command is used.
 *  * [required] If this Command Group is required or not, default: false
 *
 * @param {{name, [description], commands, [callback] [required]}} options
 *
 * @constructor
 */
function CommandGroup(options) {
    var defaults = {
        name: null,
        description: null,
        commands: [],
        callback: null,
        required: false
    };
    this.options = helpers.merge(defaults, options);


    AbstractParameter.call(this, this.options.name, this.options.description);
    this.commands = [];

	this.options.commands.forEach(function (command) {
		if (command instanceof Command) {
			//Commands are Command objects
			this.commands.push(command);
		}
		else {
			throw new ConfigError("Command: " + this.options.command + " of group " + this.options.name + " was configured wrong, must be Array or Command object");
		}
	}.bind(this));
}
util.inherits(CommandGroup, AbstractParameter);

/**
 * Parse Commands
 *
 * Loop through remaining args, one by one, check each command group
 * @param args
 * @param commandGroups
 */
CommandGroup.parse = function (args, commandGroups) {
    var params = {};

    for (var i = 0; i < commandGroups.length; i++) {
        debug('Checking on command group: ' + commandGroups[i].name);
        var commandGroup = commandGroups[i],
            found = false,
            command;

        commandGroup.commands.forEach(function (command) {
            if (args[0] == command.options.name) {
                debug("Command found: " + commandGroup.options.name + " = " + args[0]);
                params[commandGroup.options.name] = command.name;
                if (command.options.callback instanceof Function) {
                    command.options.callback.call(this, this, command);
                }
                if (commandGroup.options.callback instanceof Function) {
                    commandGroup.options.callback.call(this, this, command);
                }
                found = true;
                args.shift();
                return false;
            }
        }.bind(this));

        if (!found && commandGroup.required) {
            debug('Not found!!');
            throw new InvalidInputError("Command Group " + commandGroup.name + " is required and cannot be omitted");
        }
    }
    return params;
};

module.exports = CommandGroup;