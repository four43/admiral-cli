#!/usr/bin/node
var Option = require('./option'),
	Flag = require('./flag'),
	Command = require('./command'),
	CliError = require('./error'),
	debug = require('debug')('cli');

function Cli(appDescription) {

	this.scriptName = null;

	this.params = {};
	this.options = [];
	this.flags = [];
	this.commandGroups = [];
}

Cli.prototype.addCommandGroup = function (name, description, commands, callback, required) {
	var commandGroup = {
		name: name,
		description: description,
		commands: [],
		callback: callback,
		required: required
	}
	commands.forEach(function (command) {
		if (command instanceof Command) {
			//Commands are Command objects
			commandGroup.commands.push(command);
		}
		else if (command instanceof Array) {
			//Commands are arrays
			commandGroup.commands.push(new Command(command[0], command[1], command[2], command[3]));
		}
		else {
			throw new CliError("Command: " + command + " of group " + name + "was configured wrong, must be Array or Command object");
		}
	}.bind(this));
	this.commandGroups.push(commandGroup);
	return this;
}

Cli.prototype.option = function (name, description, short, long, type, required) {
	this.options.push(new Option(name, description, short, long, type, required));
	return this;
}

Cli.prototype.flag = function (name, description, short, long) {
	this.flags.push(new Flag(name, description, short, long));
	return this;
}

/**
 * Parse
 *
 *
 * @param args
 * @returns {boolean}
 * @throws {CliError}
 */
Cli.prototype.parse = function (args) {
	if (args == undefined) {
		args = process.argv;
	}
	console.log(args);
	//Parse Script Name
	this.scriptName = args.shift();

	this.params = {};

	//Parse Option
	Cli._merge(this.params, this.parseOption(args, this.options));

	//Parse flags
	Cli._merge(this.params, this.parseFlags(args, this.flags));

	//Parse Commands
	Cli._merge(this.params, this.parseCommands(args, this.commandGroups));

	//Parse Commands Groups (order of these matter)
	console.log('Params end of parse', this.params);

	return true;
}

/**
 * Parse Option
 *
 * Parses Options from args, matches Options to args.
 *
 * *NOTE* Modifies args param, removes parsed options.
 * @param {String[]} args
 * @param {Option[]} options
 * @return {Object}
 * @
 */
Cli.prototype.parseOption = function (args, options) {
	var params = {};
	options.forEach(function (option) {
		debug('Testing option: ' + option.short, args);
		var optionIndex = args.indexOf(option.short);
		var optionLongIndex = args.indexOf(option.long);
		if (optionIndex !== -1 || optionLongIndex !== -1) {
			var index = (optionIndex !== -1) ? optionIndex : optionLongIndex;
			params[option.name] = args[index + 1];
			args = args.slice(0, index).concat(args.slice(index + 2));
		}
		else if (option.required) {
			debug("Option " + option.short + "/" + option.long + " not found");
			throw new CliError(option.short + "/" + option.long + " is required, and wasn't found");
		}
	}.bind(this));
	return params;
}

Cli.prototype.parseFlags = function (args, flags) {
	var params = {};
	for (var i = 1; i < args.length; i++) {
		var arg = args[i];
		if (arg.match(/^\-\-/)) {
			//Long version flags --
			debug("Flag(s) (Long version) found: " + arg);
			var flag = this._findFlag(arg, flags);
			if (flag) {
				params[flag.name] = true;
				args = args.slice(0, i).concat(args.slice(i + 1));
				i--;
			}
			else {
				throw new CliError("Flag '" + arg + "' is unknown");
			}
		}
		else if (arg[0] == "-") {
			//Short version flags -
			debug("Flag(s) found: " + arg);
			arg = arg.substr(1);
			for (var j = 0; j < arg.length; j++) {
				var flag = this._findFlag('-' + arg[j], flags);
				if (flag) {
					params[flag.name] = true;
				}
				else {
					throw new CliError("Flag '" + arg + "' is unknown");
				}
			}
			args = args.slice(0, i).concat(args.slice(i + 1));
			i--;
		}
	}
	//Set all other registered flags to false
	flags.forEach(function (flag) {
		if (!params.hasOwnProperty(flag.name)) {
			params[flag.name] = false;
		}
	}.bind(this));
	return params;
}

/**
 * Parse Commands
 *
 * Loop through remaining args, one by one, check each command group
 * @param args
 * @param commandGroups
 */
Cli.prototype.parseCommands = function (args, commandGroups) {
	var params = {};
	var commandGroupCursor = 0;
	args.forEach(function (arg) {
		for (; commandGroupCursor < commandGroups.length; commandGroupCursor++) {
			var commandGroup = commandGroups[commandGroupCursor],
				found = false;
			for (var i = 0; i < commandGroup.commands.length; i++) {
				var command = commandGroup.commands[i];
				console.log("Checking: " + arg + " =? " + command.name);
				if (arg === command.name) {
					//Found
					console.log("Command found: " + commandGroup.name + " = " + arg);
					params[commandGroup.name] = command.name;
					if(command.callback instanceof Function) {
						command.callback.call(this, arg);
					}
					found = true;
					break;
				}
			}
			if (found) {
				if(commandGroup.callback instanceof Function) {
					commandGroup.callback.call(this, arg);
				}
				break;
			}
			else if(commandGroup.required) {
				throw new CliError("Command Group " + commandGroup.name + " is required and cannot be omitted");
			}
		}
	}.bind(this));
	console.log(args);
	console.log(commandGroups);
	//process.exit(5);
	console.log('Params, end of function', params);
	return params;
}

Cli.prototype.getHelpText = function () {

}

Cli.prototype._findFlag = function (key, flags) {
	debug('_findFlag: ' + key);
	for (var i = 0; i < flags.length; i++) {
		var flag = flags[i];
		if (flag.short == key || flag.long == key) {
			debug('Flag found!', flag);
			return flag;
		}
	}
	debug('returning null');
	return null;
}

/**
 * Merge
 *
 * Just a simple little object merge.
 *
 * @param objectA
 * @param objectB
 * @returns {{}}
 * @private
 */
Cli._merge = function (objectA, objectB) {
	console.log('Merging: ', objectA, objectB);
	for (var attrName in objectB) {
		objectA[attrName] = objectB[attrName];
	}
	console.log("Merged: ", objectA);
	return objectA;
}

module.exports = Cli;