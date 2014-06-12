#!/usr/bin/node

function CliError(message, statusCode) {
	Error.call(this, message, statusCode);
	Error.captureStackTrace(this, CliError);

	this.message = message || this.message
}
CliError.prototype = Object.create(Error.prototype);

CliError.prototype.setMessage = function (message) {
	return message || "There has been an error with the CLI framework."
}

module.exports = CliError;