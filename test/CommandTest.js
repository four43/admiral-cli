var assert = require('assert'),
	Cli = require('./../lib/Cli'),
	CliError = require('./../lib/error/abstract-error'),
	Command = require('./../lib/Command');

describe("Commands", function () {
	it("Should parse basic command", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({name: 'test1', description: 'The first command option'}),
					new Command({name: 'test2', description: 'The second command option'})
				]
			})
			.parse(['node', 'cli-test.js', 'test1']);
		assert.equal(cli.params.cmd1, 'test1');

		cli.parse(['node', 'cli-test.js', 'test2']);
		assert.equal(cli.params.cmd1, 'test2');
	});

	it("Should parse basic command, multiple commands", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({name: 'test1', description: 'The first command option'}),
					new Command({name: 'test2', description: 'The second command option'})
				],
				required: true
			})
			.commandGroup({
				name: 'cmd2',
				description: 'secondary route for the program',
				commands: [
					new Command({name: 'testA', description: 'The first command option'}),
					new Command({name: 'testB', description: 'The second command option'})
				],
				required: true
			})
			.parse(['node', 'cli-test.js', 'test1', 'testB']);
		assert.equal(cli.params.cmd1, 'test1');
		assert.equal(cli.params.cmd2, 'testB');
	});

	it("Should error on missing command", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({name: 'test1', description: 'The first command option'}),
					new Command({name: 'test2', description: 'The second command option'})
				],
				required: true
			});

		assert.throws(function () {
			cli.parse(['node', 'cli-test.js', 'test3']);
		});
	});

	it("Should execute command callbacks", function () {
		var cli = new Cli();

		var resultCommand = {};
		var resultGroup = {};
		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({
						name: 'test1', description: 'The first command option', callback: function (cli, command) {
							resultCommand = command;
						}
					}),
					new Command({
						name: 'test2', description: 'The second command option', callback: function (cli, command) {
							resultCommand = 'Hello World';
						}
					})
				],
				callback: function (cli, command) {
					resultGroup = command;
				}.bind(this)
			})
			.parse(['node', 'cli-test.js', 'test1']);
		assert.equal(cli.params.cmd1, 'test1');
		assert.equal(resultCommand.name, 'test1');
		assert.equal(resultGroup.name, 'test1');

		cli.parse(['node', 'cli-test.js', 'test2']);
		assert.equal(cli.params.cmd1, 'test2');
		assert.equal(resultCommand, 'Hello World');
		assert.equal(resultGroup.name, 'test2');
	});

	it("Should error on extra command", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command('test1', 'The first command option'),
					new Command('test2', 'The second command option')
				]
			});

		assert.throws(function () {
			cli.parse(['node', 'cli-test.js', 'test3']);
		});
	});
});