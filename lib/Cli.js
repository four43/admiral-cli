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
	if (args == undefined) {
		args = process.argv;
	}
	var helpCalled = false;
	//Pull off the node path
	args.shift();

	//Parse Script Name
	if (this.scriptName == null) {
		this.scriptName = args.shift();
	}
	else {
		args.shift();
	}
	this.params = {};

	if (args.length === 0 && this.helpOnNoArgs) {
		return this.getHelpText();
	}

	//Parse flags - Make sure we grab help text first
	var flagParams = Flag.parse(args, this.flags, {
			verboseEnabled: this.verboseEnabled,
			helpEnabled: this.helpEnabled,
			allowExtra: this.allowExtraArgs
		},
		function () {
			this.getHelpText();
			helpCalled = true;
		}.bind(this)
	);
	helpers.merge(this.params, flagParams);

	if (!helpCalled) {
		//Parse Option
		helpers.merge(this.params, Option.parse(args, this.options));

		//Parse Command Groups
		helpers.merge(this.params, CommandGroup.parse(args, this.commandGroups));

		//Parse EnvVars
		helpers.merge(this.env, EnvVar.parse(this.processEnv, this.envVars));

		if (!this.allowExtraArgs) {
			this.checkForExtras(args);
		}
		return this.params;
	}
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