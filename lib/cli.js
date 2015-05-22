#!/usr/bin/node
var Option = require('./option'),
	Flag = require('./flag'),
	Command = require('./command'),
	CommandGroup = require('./command-group'),
	debug = require('debug')('cli'),
    helpers = require('./helpers'),

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
		description: '',
		allowExtraArgs: false
	};
	this.cliOptions = helpers.merge(defaults, cliOptions);

	this.scriptName = this.cliOptions.scriptName;
	this.verboseEnabled = this.cliOptions.verboseEnabled;
	this.helpEnabled = this.cliOptions.helpEnabled;

	this.params = {};
	this.options = [];
	this.flags = [];
	this.commandGroups = [];

    if(this.verboseEnabled) {
        this.params.verbose = 0;
    }
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
Cli.prototype.option = function (options) {
	this.options.push(new Option(options));
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
Cli.prototype.flag = function (options) {
	this.flags.push(new Flag(options));
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
	//Pull off the node path
	args.shift();

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
    helpers.merge(this.params, Option.parse(args, this.options));

	//Parse flags
	var flagParams = Flag.parse(args, this.flags, this.verboseEnabled, this.helpEnabled, this.getHelpText.bind(this));
    helpers.merge(this.params, flagParams);

	//Parse Commands
    helpers.merge(this.params, this.parseCommands(args, this.commandGroups));

	if(!this.allowExtraArgs) {
		this.checkForExtras(args);
	}
	return this.params;
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

	flags = Cli.deepCopy(flags);
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



module.exports = Cli;