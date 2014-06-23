var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error/abstract-error'),
	Command = require('./../lib/command');

exports.testCommandBasic = function (test) {
	var cli = new Cli();

	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option'),
				new Command('test2', 'The second command option')
			]
		)
		.parse(['cli-test.js', 'test1']);
	test.equal(cli.params.cmd1, 'test1');

	cli.parse(['cli-test.js', 'test2']);
	test.equal(cli.params.cmd1, 'test2');
	test.done();
}

exports.testCommandBasicMultiple = function (test) {
	var cli = new Cli();

	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option'),
				new Command('test2', 'The second command option')
			],
			null,
			true
		)
		.addCommandGroup(
			'cmd2',
			'secondary route for the program', [
				new Command('testA', 'The first command option'),
				new Command('testB', 'The second command option')
			],
			null,
			true
		)
		.parse(['cli-test.js', 'test1', 'testB']);
	test.equal(cli.params.cmd1, 'test1');
	test.equal(cli.params.cmd2, 'testB');
	test.done();
}

exports.testCommandMissing = function (test) {
	var cli = new Cli();

	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option'),
				new Command('test2', 'The second command option')
			],
			null,
			true
		);

	test.throws(function () {
		cli.parse(['cli-test.js', 'test3']);
	});
	test.done();
}

exports.testCommandCallbacks = function (test) {
	var cli = new Cli();

	var resultCommand = {};
	var resultGroup = {};
	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option', function(cli, command) {
					resultCommand = command;
				}),
				new Command('test2', 'The second command option', function(cli, command) {
					resultCommand = 'Hello World';
				})
			],
			function(cli, command) {
				resultGroup = command;
			}.bind(this)
		)
		.parse(['cli-test.js', 'test1']);
	test.equal(cli.params.cmd1, 'test1');
	test.equal(resultCommand.name, 'test1');
	test.equal(resultGroup.name, 'test1');

	cli.parse(['cli-test.js', 'test2']);
	test.equal(cli.params.cmd1, 'test2');
	test.equal(resultCommand, 'Hello World');
	test.equal(resultGroup.name, 'test2');
	test.done();
}

exports.testExtraCommand = function(test) {
	var cli = new Cli();

	cli
		.addCommandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option'),
				new Command('test2', 'The second command option')
			],
			null
		);

	test.throws(function () {
		cli.parse(['cli-test.js', 'test3']);
	});
	test.done();
}