#!/usr/bin/node
var Option = require('./option'),
	Flag = require('./flag'),
	Command = require('./command'),
	CommandGroup = require('./command-group'),
	debug = require('debug')('cli'),

	ConfigError = require('./error/config'),
	InvalidInputError = require('./error/invalid-input');

/**
 * Cli Constructor
 *
 * Create a new Cli Object, pass in options to configure the base Cli.
 *
 * Options (type, default value):
 *
 * * scriptName (string, null) - The name of cli script, this is automatically parsed, but use this as an override. Used in displaying documentation.
 * * verboseEnabled (boolean, true) - Automatically parse -v, -vv, -vvv, and --verbose
 *
 * @param cliOptions
 * @constructor
 */
function Cli(cliOptions) {

	var defaults = {
		scriptName: null,
		verboseEnabled: true,
		helpEnabled: true,
		helpOnNoArgs: true,
		exitOnHelp: true,
		description: ''
	};
	this.cliOptions = Cli._merge(defaults, cliOptions);

	this.scriptName = this.cliOptions.scriptName;
	this.verboseEnabled = this.cliOptions.verboseEnabled;
	this.helpEnabled = this.cliOptions.helpEnabled;

	this.params = {};
	this.options = [];
	this.flags = [];
	this.commandGroups = [];
}

/**
 * Add Command Group
 *
 * Create a command group and add it to the config.
 * @param {String} name
 * @param {String} [description]
 * @param {Command[]|[]} commands
 * @param {Function} [callback]
 * @param {Boolean} [required]
 * @returns {Cli}
 */
Cli.prototype.commandGroup = function (name, description, commands, callback, required) {
	this.commandGroups.push(new CommandGroup(name, description, commands, callback, required));
	return this;
};

/**
 * Add Option
 *
 * Adds an Option to the CLI to be checked during the parse() method. See Option for more info.
 * @param {String} name The name of the option
 * @param {String} description Description of the option, used in help text and error messages.
 * @param {String} [short] Short version of Option, usually a "-" and a single character.
 * @param {String} [long] Long version of the Option, a "--" and multiple characters.
 * @param {String} [type]
 * @param {Number|String} [numValues] Number of values, how many values should follow the option. Can be 1 (default), any
 * integer, * (multiple), or + (at least 1)
 * @returns {Cli}
 */
Cli.prototype.option = function (name, description, short, long, type, numValues) {
	this.options.push(new Option(name, description, short, long, type, numValues));
	return this;
};

/**
 * Add Flag
 *
 * Adds a Flag to the CLI to be checked during the parse() method. See Flag for more info.
 * @param {String} name Name of the flag, it will be stored as cli.params.[name]
 * @param {String} [description] Description of the flag. Used in help text.
 * @param {String} short Short version of the flag, starts with '-' and is one more character.
 * @param {String} [long] The long version of the flag, starts with '--' and is one or more characters.
 * @param {*} [value] The value to set the variable to if this flag is passed. Defaults to true.
 * @returns {Cli}
 */
Cli.prototype.flag = function (name, description, short, long, value) {
	this.flags.push(new Flag(name, description, short, long, value));
	return this;
};

/**
 * Parse
 *
 * Take the arguments (or array passed) and parse it into the params object.
 * @param {String[]} [args] An optional array of args, the process.argv is used by default.
 * @returns {Object}
 * @throws ConfigError
 * @throws InvalidInputError
 */
Cli.prototype.parse = function (args) {
	if (args == undefined) {
		args = process.argv;
	}

	//Parse Script Name
	if (this.scriptName === null) {
		this.scriptName = args.shift();
	}
	else {
		args.shift();
	}
	this.params = {};

	if(args.length === 0 && this.cliOptions.helpOnNoArgs) {
		return this.getHelpText();
	}

	//Parse Option
	Cli._merge(this.params, this.parseOption(args, this.options));

	//Parse flags
	var flagParams = this.parseFlags(args, this.flags);
	Cli._merge(this.params, flagParams);

	//Parse Commands
	Cli._merge(this.params, this.parseCommands(args, this.commandGroups));

	this.checkForExtras(args);

	return this.params;
};

/**
 * Parse Option
 *
 * Parses Options from args, matches Options to args. Options have a `numValues` propery that can be 1 (default), any
 * integer, or "*" to mean one value, a fixed number of values, or any number of values.
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
			var index = (optionIndex !== -1) ? optionIndex : optionLongIndex,
				value;
			switch (option.numValues) {
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
							value = args.splice(index, 1);
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
					debug("\t-Multiple mode " + option.numValues);
					params[option.name] = [];
					args.splice(index, 1);
					while (true) {
						debug("\t\t-Testing: " + args[index]);
						if (args[index] && args[index][0] != '-') {
							value = args.splice(index, 1);
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
					for (var i = 1; i <= option.numValues; i++) {
						if (args[0][0] != '-') {
							value = args.shift();
							if (!option.validateType(value.toString())) {
								throw new InvalidInputError("Option " + option.name + " had an invalid type: " + value + " wasn't of type " + option.type);
							}
							params[option.name].push(value);
						}
						else {
							throw new InvalidInputError('Option ' + option.name + ' requires ' + option.numValues + ' but stopped at ' + args[index + i]);
						}
					}
			}
			if (params[option.name] instanceof Array && params[option.name].length === 0) {
				params[option.name] = null;
			}
		}
		else if (option.numValues > 0) {
			debug("Option " + option.short + "/" + option.long + " not found");
			throw new InvalidInputError(option.short + "/" + option.long + " is required, and wasn't found");
		}
	}.bind(this));
	debug('Args after option: ' + JSON.stringify(args) + "\n");
	return params;
};

/**
 * Parse Flags
 *
 * Parses the args against the Flags
 * @param {Array} args
 * @param {Flag[]} flags
 * @returns {{}}
 */
Cli.prototype.parseFlags = function (args, flags) {
	var params = {};

	flags = Cli._deepCopy(flags);
	if(this.verboseEnabled) {
		//Add flags for verbose.
		flags.push(new Flag('verbose', 'The verbosity level of the application', '-v', '--verbose', 1));
		this.params.verbose = 0;
	}

	if(this.helpEnabled) {
		flags.push(new Flag('help', 'Display the help text', null, '--help'));
	}

	for (var i = 0; i < args.length; i++) {
		var arg = args[i],
			flag;
		if (arg.match(/^\-\-/)) {
			//Long version flags --
			debug("Flag(s) (Long version) found: " + arg);
			flag = this._findFlag(arg, flags);
			if (flag) {
				params[flag.name] = flag.value;
				args.splice(i, 1);
				i--;
			}
			else {
				throw new ConfigError("Flag '" + arg + "' is unknown");
			}
		}
		else if (arg[0] == "-") {
			//Short version flags -
			debug("Flag(s) found: " + arg);
			arg = arg.substr(1);
			for (var j = 0; j < arg.length; j++) {
				flag = this._findFlag('-' + arg[j], flags);
				if (flag) {
					if(params.hasOwnProperty(flag.name) && !isNaN(params[flag.name]) && !isNaN(flag.value)) {
						params[flag.name] += flag.value;
					}
					else {
						params[flag.name] = flag.value;
					}
				}
				else {
					throw new InvalidInputError("Flag '" + arg + "' is unknown");
				}
			}
			args.splice(i, 1);
			i--;
		}

		if(flag && flag.name === 'help') {
			return this.getHelpText();
		}
	}
	//Set all other registered flags to false
	flags.forEach(function (flag) {
		if (!params.hasOwnProperty(flag.name)) {
			params[flag.name] = false;
		}
	}.bind(this));
	return params;
};

/**
 * Parse Commands
 *
 * Loop through remaining args, one by one, check each command group
 * @param args
 * @param commandGroups
 */
Cli.prototype.parseCommands = function (args, commandGroups) {
	var params = {};

	for (var i = 0; i < commandGroups.length; i++) {
		debug('Checking on command group: ' + commandGroups[i].name);
		var commandGroup = commandGroups[i],
			found = false,
			command;

		commandGroup.commands.forEach(function (command) {
			if (args[0] == command.name) {
				debug("Command found: " + commandGroup.name + " = " + args[0]);
				params[commandGroup.name] = command.name;
				if (command.callback instanceof Function) {
					command.callback.call(this, this, command);
				}
				if (commandGroup.callback instanceof Function) {
					commandGroup.callback.call(this, this, command);
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

/**
 * Check For Extras
 *
 * Checks for remaining args and throws an error.
 * @throws InvalidInputError
 * @param args
 */
Cli.prototype.checkForExtras = function (args) {
	if (args.length) {
		throw new InvalidInputError("Invalid extra params supplied: " + args.join(', '));
	}
};

Cli.prototype.getHelpText = function () {
	var TtyParser = require('./output-parsers/tty');
	var ttyParser = new TtyParser(this);
	ttyParser.output();
	if(this.exitOnHelp) {
		process.exit(3);
	}
};

/**
 * Find Flag
 *
 * Given a `key` that represents the long or short version of a flag, return the flag object from `flags`
 * @param {String} key The needle, the long or short string that represents a flag.
 * @param {Flag[]} flags
 * @returns {*}
 * @private
 */
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
};

/**
 * Merge
 *
 * Just a simple little object merge. Overrides objectA with objectB
 *
 * @param {Object} objectA - Starting object
 * @param {Object} objectB - Object who's keys override objectA's
 * @returns {{}}
 * @private
 */
Cli._merge = function (objectA, objectB) {
	for (var attrName in objectB) {
		if (objectA.hasOwnProperty(attrName) && objectA[attrName] instanceof Object && objectB.hasOwnProperty(attrName) && objectB[attrName] instanceof Object) {
			objectA[attrName] = Cli._merge(objectA[attrName], objectB[attrName]);
		}
		else {
			objectA[attrName] = objectB[attrName];
		}
	}
	return objectA;
};

/**
 * Deep Copy
 *
 * Creates a new object, copying the variables one by one into it.
 * Available as a GitHub Gist: https://gist.github.com/four43/f93647e8feaa54713cfe
 * @param {Object|Array} input The input object or array to copy.
 * @param {Number} [maxDepth] The max depth the function should recurse before passing by reference, default: 5
 * @param {Number} [depth] Starts at 0, used by recursion
 * @returns {Object|Array}
 * @private
 */
Cli._deepCopy = function(input, maxDepth, depth) {
	if (maxDepth === undefined) {
		maxDepth = 5;
	}
	if (depth === undefined) {
		depth = 0;
	}

	if(depth > maxDepth) {
		return null;
	}

	// Handle the 3 simple types, and null or undefined
	if (input === null || input === undefined || typeof input !== "object") {
		return input;
	}

	// Date
	if (input instanceof Date) {
		var dateCopy = new Date();
		dateCopy.setTime(input.getTime());
		return dateCopy;
	}

	// Array
	if (input instanceof Array) {
		var arrayCopy = [];
		for (var i = 0, len = input.length; i < len; i++) {
			arrayCopy[i] = this._deepCopy(input[i], maxDepth, depth + 1);
		}
		return arrayCopy;
	}
	// Object
	if (input instanceof Object) {
		var newObj = {};
		for (var prop in input) {
			if (input.hasOwnProperty(prop)) newObj[prop] = this._deepCopy(input[prop]);
		}
		return newObj;
	}
};

module.exports = Cli;