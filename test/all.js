var Cli = require('./../lib/cli'),
	Command = require('./../lib/command'),
	CliError = require('./../lib/error/abstract-error'),
	CliInvalidInputError = require('./../lib/error/invalid-input');

exports.testVerbosePlain = function (test) {
	var cli = new Cli({helpOnNoArgs: false});
	cli.parse(['node', 'test.js']);
	test.equal(cli.params.verbose, 0);
	test.done();
};

exports.testVerboseV1 = function (test) {
	var cli = new Cli();
	cli.parse(['node', 'test.js', '-v']);
	test.equal(cli.params.verbose, 1);
	test.done();
};

exports.testVerboseV2 = function (test) {
	var cli = new Cli();
	cli.parse(['node', 'test.js', '-vv']);
	test.equal(cli.params.verbose, 2);
	test.done();
};

exports.testVerboseV3 = function (test) {
	var cli = new Cli();
	cli.parse(['node', 'test.js', '-vvv']);
	test.equal(cli.params.verbose, 3);
	test.done();
};

exports.testVerboseVLong = function (test) {
	var cli = new Cli();
	cli.parse(['node', 'test.js', '--verbose']);
	test.equal(cli.params.verbose, 1);
	test.done();
};

exports.testVerboseOff = function (test) {
	var cli = new Cli({verboseEnabled: false});
	test.throws(function () {
		cli.parse(['node', 'test.js', '-v']);
	});
	test.done();
};

exports.testMultiple1 = function (test) {
	var cli = new Cli();
	cli
		.commandGroup('cmd', 'The primary command group', [
			new Command('push', 'Push up to the remote'),
			new Command('pull', 'Pull from the upstream')
		], null, true)
		.flag('force', 'Force the command to execute', '-f', '--force')
		.option('remote', 'The remote repo to push to', '-r', '--remote', 'string')
		.parse(['node', 'test.js', 'push', '-f', '-r', 'origin']);
	test.equal(cli.params.cmd, 'push');
	test.equal(cli.params.force, true);
	test.equal(cli.params.remote, 'origin');
	test.done();
};

exports.testExtraError = function (test) {
	var cli = new Cli();
	cli
		.commandGroup('cmd', 'The primary command group', [
			new Command('push', 'Push up to the remote'),
			new Command('pull', 'Pull from the upstream')
		], null, true)
		.flag('force', 'Force the command to execute', '-f', '--force')
		.option('remote', 'The remote repo to push to', '-r', '--remote', 'string');

	test.throws(function() {
		cli.parse(['node', 'test.js', 'push', '-f', '-r', 'origin', '-h', 'world']);
	}, CliInvalidInputError, 'Error should be thrown when there are too many arguments (default behavior)');
	test.done();
};

exports.testExtraOkay = function (test) {
	var cli = new Cli({
		allowExtraArgs: true
	});
	cli
		.commandGroup('cmd', 'The primary command group', [
			new Command('push', 'Push up to the remote'),
			new Command('pull', 'Pull from the upstream')
		], null, true)
		.flag('force', 'Force the command to execute', '-f', '--force')
		.option('remote', 'The remote repo to push to', '-r', '--remote', 'string')
		.parse(['node', 'test.js', 'push', '-f', '-r', 'origin']);
	test.equal(cli.params.cmd, 'push');
	test.equal(cli.params.force, true);
	test.equal(cli.params.remote, 'origin');
	test.done();
};