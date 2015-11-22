var assert = require("assert"),
	Cli = require('./../lib/Cli'),
	CliError = require('./../lib/error/abstract-error');

describe("Flags", function () {
	it("Should parse basic flag", function () {
		var cli = new Cli();
		cli
			.flag({
				name: 'test1',
				description: 'Just a test parameter',
				shortFlag: '-t',
				longFlag: '--test1'
			})
			.parse(['node', 'cli-test.js', '-t']);
		assert.ok(cli.params.test1);

		cli.parse(['node', 'cli-test.js', '--test1']);
		assert.ok(cli.params.test1);
	});

	it("Should parse multiple flags", function() {
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
		assert.ok(cli.params.test1);
		assert.ok(cli.params.test2);

		cli.parse(['node', 'cli-test.js', '--test1', '-u']);
		assert.ok(cli.params.test1);
		assert.ok(cli.params.test2);

		cli.parse(['node', 'cli-test.js', '--test1', '--test2']);
		assert.ok(cli.params.test1);
		assert.ok(cli.params.test2);

		cli.parse(['node', 'cli-test.js', '--test2']);
		assert.ok(cli.params.test2);
		assert.strictEqual(cli.params.test1, false);

		cli.parse(['node', 'cli-test.js', '-t']);
		assert.ok(cli.params.test1);
		assert.strictEqual(cli.params.test2, false);
	})
});