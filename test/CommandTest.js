var assert = require('assert'),
	Cli = require('./../lib/Cli'),
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
		var resultCli = {};
		var resultGroup = {};
		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({
						name: 'test1', description: 'The first command option', callback: function (cli, command) {
							resultCli = cli;
							resultCommand = command;
						}
					}),
					new Command({
						name: 'test2', description: 'The second command option', callback: function (cli, command) {
							resultCli = cli;
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
		assert.ok(resultCli instanceof Cli, 'resultCli was not instance of Cli');
		assert.ok(resultCommand instanceof Command, 'resultCommand was not instance of Command');
		assert.equal(resultCommand.name, 'test1');
		assert.equal(resultGroup.name, 'test1');

		cli.parse(['node', 'cli-test.js', 'test2']);
		assert.equal(cli.params.cmd1, 'test2');
		assert.ok(resultCli instanceof Cli, 'resultCli was not instance of Cli');
		assert.equal(resultCommand, 'Hello World');
		assert.equal(resultGroup.name, 'test2');
	});

	it("Should make a tree of commands easily", function () {
		var cli = new Cli();

		var finalResult;
		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Command({
						name: 'test1',
						description: 'The first command option',
						callback: function(cli, command) {
							// Append additional subgroups when this one is chosen.
							cli.commandGroup({
								name: 'test1Sub',
								description: 'the sub command to test1',
								commands: [
									new Command({
										name: 'foo',
										description: 'Foo should equal bar',
										callback: function(cli, command) {
											finalResult = 'bar';
										}
									})
								]
							});
						}
					}),
					new Command({
						name: 'test2',
						description: 'The second command option'
					})
				],
				required: true
			});

		cli.parse(['node', 'cli-test.js', 'test1', 'foo']);
		assert.equal(cli.params.cmd1, 'test1');
		assert.equal(cli.params.test1Sub, 'foo');
		assert.equal(finalResult, 'bar');
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
		}, 'Didn\'t throw error for extra params as it should');
	});
});