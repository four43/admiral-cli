var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error/abstract-error');

exports.testOptionBasic = function (test) {
	var cli = new Cli();
	cli
		.option('test1', 'Just a test parameter', '-t', '--test1', 'string')
		.parse(['cli-test.js', '-t', 'value1']);
	test.equal(cli.params.test1, 'value1');

	cli.parse(['cli-test.js']);
	test.strictEqual(cli.params.test1, undefined);

	cli
		.option('test2', 'Just another test parameter', '-u', '--test2', 'string')
		.parse(['cli-test.js', '--test2', 'value2']);
	test.equal(cli.params.test2, 'value2');
	test.done();
}

exports.testOptionMultiple = function (test) {
	var cli = new Cli();
	cli
		.option('test1', 'Just a test parameter', '-t', '--test1', 'string')
		.option('test2', 'Just another test parameter', '-u', '--test2', 'string')
		.parse(['cli-test.js', '-t', 'value1', '-u', 'hello']);
	//Shorts
	test.equal(cli.params.test1, 'value1');
	test.equal(cli.params.test2, 'hello');

	//Longs
	cli.parse(['cli-test.js', '--test1', 'value1', '--test2', 'hello']);
	test.equal(cli.params.test1, 'value1');
	test.equal(cli.params.test2, 'hello');

	//Long/short combined
	cli.parse(['cli-test.js', '-t', 'value1', '--test2', 'hello']);
	test.equal(cli.params.test1, 'value1');
	test.equal(cli.params.test2, 'hello');

	//Out of order
	cli.parse(['cli-test.js', '-u', 'hello', '--test1', 'value1']);
	test.equal(cli.params.test1, 'value1');
	test.equal(cli.params.test2, 'hello');
	test.done();
}

exports.testOptionRequired = function (test) {
	var cli = new Cli();
	cli
		.option('test1', 'Just a test parameter', '-t', '--test1', 'string', true)
		.parse(['cli-test.js', '-t', 'value1']);
	test.equal(cli.params.test1, 'value1');

	test.throws(function () {
		cli.parse(['cli-test.js']);
	}, CliError);
	test.done();
}

exports.testOptionReqiuredMultiple = function (test) {
	var cli = new Cli();
	cli
		.option('test1', 'Just a test parameter', '-t', '--test1', 'string', true)
		.option('test2', 'Just another test parameter', '-u', '--test2', 'string', true)
		.parse(['cli-test.js', '-t', 'value1', '-u', 'hello']);
	test.equal(cli.params.test1, 'value1');
	test.equal(cli.params.test2, 'hello');

	test.throws(function () {
		cli.parse(['cli-test.js', '--test1', 'value1', 'hello']);
	});
	test.done();
}