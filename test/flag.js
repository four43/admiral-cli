var Cli = require('./../lib/Cli'),
	CliError = require('./../lib/error/abstract-error');

exports.testFlagBasic = function (test) {
	var cli = new Cli();
	cli
		.flag({
            name: 'test1',
            description: 'Just a test parameter',
            shortFlag: '-t',
            longFlag: '--test1'
        })
		.parse(['node', 'cli-test.js', '-t']);
	test.ok(cli.params.test1);

	cli.parse(['node', 'cli-test.js', '--test1']);
	test.ok(cli.params.test1);
	test.done();
}

exports.testFlagsMultiple = function (test) {
	var cli = new Cli();
	cli
        .flag({
            name: 'test1',
            description: 'Just a test parameter',
            shortFlag: '-t',
            longFlag: '--test1'
        })
        .flag({
            name: 'test2',
            description: 'Just a another parameter',
            shortFlag: '-u',
            longFlag: '--test2'
        })
		.parse(['node', 'cli-test.js', '-tu']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['node', 'cli-test.js', '--test1', '-u']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['node', 'cli-test.js', '--test1', '--test2']);
	test.ok(cli.params.test1);
	test.ok(cli.params.test2);

	cli.parse(['node', 'cli-test.js', '--test2']);
	test.ok(cli.params.test2);
	test.strictEqual(cli.params.test1, false);

	cli.parse(['node', 'cli-test.js', '-t']);
	test.ok(cli.params.test1);
	test.strictEqual(cli.params.test2, false);
	test.done();
}