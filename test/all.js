var Cli = require('./../lib/cli'),
	Command = require('./../lib/command'),
	CliError = require('./../lib/error/abstract-error');

exports.multiple1 = function(test) {
	var cli = new Cli();
	cli
		.commandGroup('cmd', 'The primary command group', [
			new Command('push', 'Push up to the remote'),
			new Command('pull', 'Pull from the upstream')
		], null, true)
		.flag('force', 'Force the command to execute', '-f', '--force')
		.option('remote', 'The remote repo to push to', '-r', '--remote', 'string')
		.parse(['test.js', 'push', '-f', '-r', 'origin']);
	test.equal(cli.params.cmd, 'push');
	test.equal(cli.params.force, true);
	test.equal(cli.params.remote, 'origin');
	test.done();
}