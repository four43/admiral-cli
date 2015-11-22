var assert = require('assert'),
	Cli = require('./../lib/Cli'),
	EnvVar = require('./../lib/EnvVar'),
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
	});
});