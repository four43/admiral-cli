var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error/abstract-error');

exports.testFlagBasic = function (test) {
	var cli = new Cli();
	cli
		.flag('test1', 'Just a test parameter', '-t', '--test1')
		.parse(['cli-test.js', '-t']);
	test.ok(cli.params.test1);

	cli.parse(['cli-test.js', '--test1']);
	test.ok(cli.params.test1);
	test.done();
}

exports.testFlagsMultiple = function (test) {
	var cli = new Cli();
	cli
		.flag('test1', 'Just a test parameter', '-t', '--test1')
		.flag('test2', 'Just another test parameter', '-u', '--test2')
		.parse(['cli-test.js', '-tu']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['cli-test.js', '--test1', '-u']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['cli-test.js', '--test1', '--test2']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['cli-test.js', '--test2']);
	test.ok(cli.params.test2);
	test.strictEqual(cli.params.test1, false);

	cli.parse(['cli-test.js', '-t']);
	test.ok(cli.params.test1);
	test.strictEqual(cli.params.test2, false);
	test.done();
}