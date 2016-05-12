#!/usr/bin/node
var Command = require('./Command'),
    Cli = require('./Cli'),
    debug = require('debug')('CommandGroup'),
    Flag = require('./Flag'),
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
    this.name = options.name;
    this.description = options.description;
    this.commands = options.commands || [];
    this.callback = options.callback || function () {};
    this.required = (options.required !== undefined) ? options.required : false;

    this.commands.map(function (command) {
        if (!command instanceof Command) {
            throw new ConfigError("Command: " + command + " of group " + this.name + " was configured wrong, must be Array or Command object");
        }
    }.bind(this));
}

/**
 * Parse Commands
 *
 * Loop through remaining args, one by one, check each command group
 * @param args
 * @param commandGroups
 */
CommandGroup.parse = function (args, commandGroups, parseParams) {
    var params = {};

    for (var i = 0; i < commandGroups.length; i++) {
        debug('Checking on command group: ' + commandGroups[i].name);
        var commandGroup = commandGroups[i],
            found = false,
            command;

        commandGroup.commands.forEach(function (command) {
            if (args[0] == command.name) {
                debug("Command found: " + commandGroup.name + " = " + args[0]);

                found = true;
                args.shift();

                if(command.subElements.length) {
                    var subElements = {
                        options: [],
                        flags: [],
                        envVars: [],
                        commandGroups: []
                    };
                    command.subElements.map(function (element) {
                        if(element instanceof Flag) {
                            subElements.flags.push(element);
                        }
                    });
                    var subParams = parseParams(args, subElements, {cloneArgs: false});
                    helpers.merge(params, subParams);
                }

                params[commandGroup.name] = command.name;
                if (command.callback instanceof Function) {
                    command.callback.call(this, command);
                }
                if (commandGroup.callback instanceof Function) {
                    commandGroup.callback.call(this, command);
                }

                return false;
            }
        });

        if (!found && commandGroup.required) {
            debug('Not found!!');
            throw new InvalidInputError("Command Group " + commandGroup.name + " is required and cannot be omitted");
        }
    }
    return params;
};

module.exports = CommandGroup;