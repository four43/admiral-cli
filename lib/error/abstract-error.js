#!/usr/bin/node
/**
 * Abstract CLI Error
 *
 * General error for CLI, all errors are children of this.
 * @param message
 * @param statusCode
 * @constructor
 */
function AbstractCliError(message, statusCode) {
	Error.call(this, message, statusCode);
	Error.captureStackTrace(this, AbstractCliError);

	this.message = message || this.message
}
AbstractCliError.prototype = Object.create(Error.prototype);

AbstractCliError.prototype.setMessage = function (message) {
	return message || "There has been an error with the CLI framework."
}

module.exports = AbstractCliError;