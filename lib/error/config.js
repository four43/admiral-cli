#!/usr/bin/node
var CliConfigError = require('./abstract-error');
/**
 * CLI Config Error
 *
 * Error when the CLI params are created wrong. Should be thrown right away.
 * @param message
 * @param statusCode
 * @constructor
 */
CliConfigError.prototype.setMessage = function (message) {
	return message || "There was an issue with one or more of the inputs provided."
}

module.exports = CliConfigError;