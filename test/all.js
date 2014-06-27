var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error/abstract-error');

exports.multiple1 = function(test) {
	var cli = new Cli();
	cli
		.commandGroup()
}