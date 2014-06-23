#!/usr/bin/node
var CliInvalidInputError = require('./abstract-error');
/**
 * CLI Invalid Input Error
 *
 * Invalid user input, thrown when a user provides an invalid set of arguments.
 * @param message
 * @param statusCode
 * @constructor
 */
CliInvalidInputError.prototype.setMessage = function (message) {
	return message || "There was an issue with one or more of the inputs provided."
}

module.exports = CliInvalidInputError;