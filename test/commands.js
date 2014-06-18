var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error'),
	Command = require('./../lib/command');

exports.testCommandBasic = function (test) {
	var cli = new Cli();

	var result;
	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option')
			],
			function(command) {
				result = command;
			}.bind(this)
		)
		.parse(['cli-test.js', 'test1']);
	test.equal(cli.params.cmd1, 'test1');
	test.equal(result, 'test1');
	test.done();
}