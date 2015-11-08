var assert = require('assert'),
	Cli = require('./../lib/Cli'),
	CliError = require('./../lib/error/config'),
	InvalidInputError = require('./../lib/error/invalid-input');

describe("Options", function () {

	describe("Config Issues", function () {

		it("Should error because no options", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.option();
			}, CliError);
		});

		it("Should error because no flags", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.option({
						name: 'test1',
						description: 'Just a test parameter',
						type: 'string',
						length: 0
					});
			}, CliError);
		});

		it("Should error because bad short flag", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.option({
						name: 'test1',
						description: 'Just a test parameter',
						shortFlag: 't',
						longFlag: '--test1',
						type: 'string',
						length: 0
					});
			}, CliError);
		});

		it("Should error because bad long flags", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.option({
						name: 'test1',
						description: 'Just a test parameter',
						shortFlag: '-t',
						longFlag: '-test1',
						type: 'string',
						length: 0
					});
			}, CliError);
		});

		it("Should fail on 0 length", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.option({
						name: 'test1',
						description: 'Just a test parameter',
						shortFlag: '-t',
						longFlag: '--test1',
						type: 'string',
						length: 0
					});
			}, CliError);
		});
	});

	describe("Basic Parsing", function () {
		it("Should parse string basic", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string'
				})
				.parse(['node', 'cli-test.js', '-t', 'value1']);
			assert.equal(cli.params.test1, 'value1');
		});

		it("Should parse custom basic", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'hippos'
				})
				.parse(['node', 'cli-test.js', '-t', 'value1']);
			assert.equal(cli.params.test1, 'value1');
		});

		it("Should parse number type", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'number'
				})
				.parse(['node', 'cli-test.js', '-t', '123.5']);
			assert.strictEqual(cli.params.test1, 123.5);
		});

		it("Should fail number type", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'number'
				});
			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t', 'abc']);
			}, InvalidInputError);
		});

		it("Should parse int type", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'int'
				})
				.parse(['node', 'cli-test.js', '-t', '123']);
			assert.strictEqual(cli.params.test1, 123);
		});

		it("Should fail int type", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'int'
				});
			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t', '123.4']);
			}, InvalidInputError);
		});

		it("Should validate number type with multiple length", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'number',
					length: 2
				})
				.parse(['node', 'cli-test.js', '-t', '123.5', '54.321']);
			assert.strictEqual(cli.params.test1[0], 123.5);
			assert.strictEqual(cli.params.test1[1], 54.321);
		});

		it("Should allow missing options", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string'
				})
				.parse(['node', 'cli-test.js']);
			assert.strictEqual(cli.params.test1, undefined);
		});

		it("Should be fine with not required", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					required: false
				})
				.option({
					name: 'test2',
					description: 'Just a test parameter',
					shortFlag: '-u',
					longFlag: '--test2',
					type: 'string'
				})
				.parse(['node', 'cli-test.js', '--test2', 'value2']);
			assert.equal(cli.params.test2, 'value2');
		});
	});

	describe("Multiple", function () {
		it("Should parse multiple short flag", function () {
			var cli = setupMultiple();

			cli.parse(['node', 'cli-test.js', '-t', 'value1', '-u', 'hello']);
			assert.equal(cli.params.test1, 'value1');
			assert.equal(cli.params.test2, 'hello');
		});

		it("Should parse multiple long flag", function () {
			var cli = setupMultiple();

			cli.parse(['node', 'cli-test.js', '--test1', 'value1', '--test2', 'hello']);
			assert.equal(cli.params.test1, 'value1');
			assert.equal(cli.params.test2, 'hello');
		});

		it("Should parse multiple, out of order", function () {
			var cli = setupMultiple();
			//Out of order
			cli.parse(['node', 'cli-test.js', '-u', 'hello', '--test1', 'value1']);
			assert.equal(cli.params.test1, 'value1');
			assert.equal(cli.params.test2, 'hello');
		});
	});

	describe("Required", function () {

		it("Should fail on option required", function () {
			var cli = new Cli({helpOnNoArgs: false});
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 1
				})
				.parse(['node', 'cli-test.js', '-t', 'value1']);
			assert.equal(cli.params.test1, 'value1');

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js']);
			}, CliError);
		});

		it("Should handle multiple required", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 1
				})
				.option({
					name: 'test2',
					description: 'Just a test parameter',
					shortFlag: '-u',
					longFlag: '--test2',
					type: 'string',
					length: 1
				})
				.parse(['node', 'cli-test.js', '-t', 'value1', '-u', 'hello']);
			assert.equal(cli.params.test1, 'value1');
			assert.equal(cli.params.test2, 'hello');

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '--test1', 'value1', 'hello']);
			}, InvalidInputError);
		});

	});
	describe("Length", function () {

		it("Should parse with fixed length", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 3
				})
				.parse(['node', 'cli-test.js', '-t', 'value1', 'value2', 'value3']);

			var actual = ['value1', 'value2', 'value3'];
			for (var i = 0; i < actual.length; i++) {
				assert.equal(cli.params.test1[i], actual[i]);
			}
		});

		it("Should not error when not required multiple length", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 3,
					required: false
				})
				.option({
					name: 'test2',
					description: 'Just another test parameter',
					shortFlag: '-u',
					longFlag: '--test2',
					type: 'string',
					length: 1
				})
				.parse(['node', 'cli-test.js', '--test2', 'hello']);

			assert.equal(cli.params.test2, 'hello');
		});

		it("Should fail on too few", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 3
				});

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t', 'hello']);
			}, InvalidInputError);

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t', 'hello', 'world']);
			}, InvalidInputError);
		});

		it("Should fail on too many", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: 3
				});

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t', 'hello', 'world', 'too', 'many']);
			}, InvalidInputError);
		});

		it("Should parse length -1, any length", function () {
			var cli = new Cli(),
				i,
				actual;

			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: -1
				})
				.parse(['node', 'cli-test.js', '-t', 'hello', 'world', 'here', 'are', 'many']);

			actual = ['hello', 'world', 'here', 'are', 'many'];
			for (i = 0; i < actual.length; i++) {
				assert.equal(cli.params.test1[i], actual[i]);
			}
		});

		it("Should parse length -1, any length not required", function () {
			var cli = new Cli(),
				i,
				actual;

			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: -1,
					required: false
				})
				.option({
					name: 'test2',
					description: 'Just another test parameter',
					shortFlag: '-u',
					longFlag: '--test2',
					type: 'string',
					length: 1
				})
				.parse(['node', 'cli-test.js', '-u', 'hello']);

			assert.equal(cli.params.test2, 'hello');
		});

		it("Should parse length -1, any length, with other options", function () {
			var cli = new Cli(),
				i,
				actual;
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: -1
				})
				.option({
					name: 'other',
					description: 'Just a test another parameter',
					shortFlag: '-o',
					longFlag: '--other',
					type: 'string'
				})
				.parse(['node', 'cli-test.js', '-t', 'hello', 'world', '-o', 'something']);
			actual = ['hello', 'world'];
			for (i = 0; i < actual.length; i++) {
				assert.equal(cli.params.test1[i], actual[i]);
			}
			assert.equal(cli.params.other, 'something');
		});

		it("Should parse star without any values", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: '*'
				})
				.parse(['node', 'cli-test.js', '-t']);

			assert.equal(cli.params.test1, null);
		});

		it("Should parse at least one", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: -1
				})
				.parse(['node', 'cli-test.js', '-t', 'hello', 'world', 'here', 'are', 'many']);

			var actual = ['hello', 'world', 'here', 'are', 'many'];
			for (var i = 0; i < actual.length; i++) {
				assert.equal(cli.params.test1[i], actual[i]);
			}
		});

		it("Should error when required, any length, but passed none", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'test1',
					description: 'Just a test parameter',
					shortFlag: '-t',
					longFlag: '--test1',
					type: 'string',
					length: -1
				});

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', '-t']);
			}, InvalidInputError);
		});
	});
});

function setupMultiple() {
	var cli = new Cli();
	cli
		.option({
			name: 'test1',
			description: 'Just a test parameter',
			shortFlag: '-t',
			longFlag: '--test1',
			type: 'string'
		})
		.option({
			name: 'test2',
			description: 'Just a test parameter',
			shortFlag: '-u',
			longFlag: '--test2',
			type: 'string'
		});
	return cli;
}