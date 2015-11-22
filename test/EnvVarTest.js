var assert = require('assert'),
	Cli = require('./../lib/Cli'),
	EnvVar = require('./../lib/EnvVar'),
	helpers = require('./../lib/helpers'),
	CliError = require('./../lib/error/config'),
	InvalidInputError = require('./../lib/error/invalid-input');

describe("EnvVar", function () {

	describe("Config Issues", function () {

		it("Should error because no options", function () {
			var cli = new Cli();
			assert.throws(function () {
				cli
					.envVar();
			}, CliError);
		});
	});

	describe("Basic Parsing", function () {
		it("Should parse string basic", function () {
			var envVar = new EnvVar({
				name: 'HELLO'
			});
			var parsed = EnvVar.parse({HELLO: 'WORLD'}, [envVar]);
			assert.equal(parsed.HELLO, 'WORLD');
		});

		it("Should parse just our EnvVar", function () {
			var envVar = new EnvVar({
				name: 'HELLO'
			});
			var parsed = EnvVar.parse({
				HELLO: 'WORLD',
				FOO: 'bar'
			}, [envVar]);
			assert.equal(parsed.HELLO, 'WORLD');
			assert.equal(Object.keys(parsed).length, 1);
		});

		it("Should error if required", function () {
			var envVar = new EnvVar({
				name: 'HELLO'
			});
			assert.throws(function () {
				EnvVar.parse({EARTH: 'WORLD'}, [envVar]);
			}, InvalidInputError);
		});

		it("Should not error if not required", function () {
			var envVar = new EnvVar({
				name: 'HELLO',
				required: false
			});
			var parsed = EnvVar.parse({
				FOO: 'bar'
			}, [envVar]);
			assert.equal(Object.keys(parsed).length, 0);
		});

		it("Should still parse if not required", function () {
			var envVar = new EnvVar({
				name: 'HELLO',
				required: false
			});
			var parsed = EnvVar.parse({
				HELLO: 'WORLD',
				FOO: 'bar'
			}, [envVar]);
			assert.equal(parsed.HELLO, 'WORLD');
			assert.equal(Object.keys(parsed).length, 1);
		});
	});

	describe("Cli Integration", function () {

		it("Should error on missing EnvVar", function () {
			var cli = new Cli({
				processEnv: {HELLO: 'WORLD'},
				helpOnNoArgs: false
			});
			assert.throws(function () {
				cli
					.envVar({
						name: 'HELLO_TEST123'
					})
					.parse(['node', 'cli-test.js']);
			}, CliError);
		});

		it("Should parse string basic cli integration", function () {
			var cli = new Cli({
				processEnv: {HELLO: 'WORLD'},
				helpOnNoArgs: false
			});
			cli
				.envVar({
					name: 'HELLO'
				})
				.parse(['node', 'cli-test.js']);
			assert.equal(cli.env.HELLO, 'WORLD');
		});

		it("Should parse string basic cli integration", function () {
			var cli = new Cli({
				processEnv: {
					HELLO: 'WORLD',
					foo: 'bar'
				},
				helpOnNoArgs: false
			});
			cli
				.envVar({
					name: 'HELLO'
				})
				.parse(['node', 'cli-test.js']);
			assert.equal(cli.env.HELLO, 'WORLD');
			assert.equal(Object.keys(cli.env).length, 1);
		});

	})
});