#!/usr/bin/node
var Cli = require('./lib/cli'),
	CliCommand = require('./lib/command'),
	CliInvalidInputError = require('./lib/error/invalid-input'),
	CliConfigError = require('./lib/error/config');

//Cli export as instantiated object
exports = module.exports = Cli;

//Other exports for errors
exports.InvalidInputError = CliInvalidInputError;
exports.ConfigError = CliConfigError;
exports.Command = CliCommand;