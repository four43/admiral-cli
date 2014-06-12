var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error');
/*
exports.testCommandBasic = function (test) {
	var cli = new Cli();

	var result;
	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				['test1', 'Just a test parameter']
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
	*/