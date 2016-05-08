#!/usr/bin/node
var Option = require('./Option'),
	EnvVar = require('./EnvVar'),
	Flag = require('./Flag'),
	Command = require('./Command'),
	CommandGroup = require('./CommandGroup'),
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
	if (cliOptions === undefined) {
		cliOptions = {};
	}

	this.description = cliOptions.description || '';
	this.scriptName = cliOptions.scriptName;
	this.verboseEnabled = (cliOptions.verboseEnabled !== undefined) ? cliOptions.verboseEnabled : true;
	this.helpEnabled = (cliOptions.helpEnabled !== undefined) ? cliOptions.helpEnabled : true;
	this.helpOnNoArgs = (cliOptions.helpOnNoArgs !== undefined) ? cliOptions.helpOnNoArgs : true;
	this.exitOnHelp = (cliOptions.exitOnHelp !== undefined) ? cliOptions.exitOnHelp : true;
	this.allowExtraArgs = (cliOptions.allowExtraArgs !== undefined) ? cliOptions.allowExtraArgs : false;

	this.options = [];
	this.flags = [];
	this.envVars = [];
	this.commandGroups = [];

	// Result Containers
	this.params = {};
	if (this.verboseEnabled) {
		this.params.verbose = 0;
	}
	this.env = {};

	//Don't use this, just for testing.
	this.processEnv = cliOptions.processEnv || process.env;
}

/**
 * Add Command Group
 *
 * Create a command group and add it to the config.
 * @param {{name, [description], commands, [callback] [required]}} options
 *
 * @see CommandGroup
 * @returns {Cli}
 */
Cli.prototype.commandGroup = function (options) {
	this.commandGroups.push(new CommandGroup(options));
	return this;
};

/**
 * Add Option
 *
 * Adds an Option to the CLI to be checked during the parse() method. See Option for more info.
 * @param {{name, description, [shortFlag], [longFlag], [type], [length]}} options
 *
 * @see Option
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
 * @param {{name, [description], short, [long], [value]}} options
 * @see Flag
 * @returns {Cli}
 */
Cli.prototype.flag = function (options) {
	this.flags.push(new Flag(options));
	return this;
};

/**
 * Add Environment Variable to check
 *
 * Adds an Environment Variable to the CLI to be checked during the parse() method. See EnvVar for more info.
 * @param options
 * @returns {Cli}
 */
Cli.prototype.envVar = function(options) {
	this.envVars.push(new EnvVar(options));
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
	var scriptArgs = this._getScriptArgs(args);

	// Parse commands remove args from array as they are parsed.
	// Make a copy so we have access to original args
	var argsToParse = scriptArgs.slice(0);

	this.params = {};

	try {
		//Parse flags
		helpers.merge(this.params, Flag.parse(argsToParse, this.flags, {
			verboseEnabled: this.verboseEnabled,
			helpEnabled: this.helpEnabled,
			allowExtra: this.allowExtraArgs
		}));

		// Show help if `--help` flag is set
		if (this.params.help) {
			return this.getHelpText();
		}

		//Parse Option
		helpers.merge(this.params, Option.parse.call(this, argsToParse, this.options));

		//Parse Command Groups
		helpers.merge(this.params, CommandGroup.parse.call(this, argsToParse, this.commandGroups));

		//Parse EnvVars
		helpers.merge(this.env, EnvVar.parse.call(this, this.processEnv, this.envVars));

		if (!this.allowExtraArgs) {
			// parse methods should have removed all entries from argsToParse
			this.checkForExtras(argsToParse);
		}
	}
	catch (err) {
		var isAdmiralError = err instanceof ConfigError || err instanceof InvalidInputError;

		// If CLI parsing failed because we have no cli args,
		// show help text
		if (!scriptArgs.length && this.helpOnNoArgs && isAdmiralError) {
			return this.getHelpText();
		}

		throw err;
	}

	return this.params;
};

/**
 * Strip out `node` executable and script name from arguments list
 * @param {string[]} argv
 * @private
 */
Cli.prototype._getScriptArgs = function(argv) {
	argv || (argv = process.argv);
	var inputArgs = argv.slice(0);

	//Pull off the node path
	inputArgs.shift();

	//Parse Script Name
	if (this.scriptName == null) {
		this.scriptName = inputArgs.shift();
	}
	else {
		inputArgs.shift();
	}

	return inputArgs;
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
	if (this.exitOnHelp) {
		process.exit(3);
	}
};


module.exports = Cli;