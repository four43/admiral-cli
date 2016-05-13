#!/usr/bin/node
var Cli = require('./lib/Cli'),
	Command = require('./lib/Command'),
	CommandGroup = require('./lib/CommandGroup'),
	Flag = require('./lib/Flag'),
	InvalidInputError = require('./lib/error/invalid-input'),
	Option = require('./lib/Option'),
	ConfigError = require('./lib/error/config');

//Cli export as instantiated object
module.exports = Cli;

//Other exports for errors
module.exports.InvalidInputError = InvalidInputError;
module.exports.ConfigError = ConfigError;
module.exports.Command = Command;
module.exports.CommandGroup = CommandGroup;
module.exports.Flag = Flag;
module.exports.Option = Option;