#!/usr/bin/node
var Option = require('./Option'),
	Flag = require('./Flag'),
	Command = require('./Command'),
	CommandGroup = require('./CommandGroup'),
    helpers = require('./Helpers'),

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
	if(cliOptions === undefined) {
		cliOptions = {};
	}
	this.cliOptions = {
		scriptName: cliOptions.scriptName,
		verboseEnabled: (cliOptions.verboseEnabled !== undefined) ? cliOptions.verboseEnabled : true,
		helpEnabled: (cliOptions.helpEnabled !== undefined) ? cliOptions.helpEnabled : true,
		helpOnNoArgs: (cliOptions.helpOnNoArgs !== undefined) ? cliOptions.helpOnNoArgs : true,
		exitOnHelp: (cliOptions.exitOnHelp !== undefined) ? cliOptions.exitOnHelp : true,
		description: cliOptions.description | '',
		allowExtraArgs: (cliOptions.allowExtraArgs !== undefined) ? cliOptions.allowExtraArgs : false
	};

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
	if (this.scriptName == null) {
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

	//Parse Command Groups
    helpers.merge(this.params, CommandGroup.parse(args, this.commandGroups));

	if(!this.allowExtraArgs) {
		this.checkForExtras(args);
	}
	return this.params;
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