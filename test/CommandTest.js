var assert = require('assert'),
	Cli = require('./../main');

describe("Commands", function () {
	it("Should parse basic command", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Cli.Command({name: 'test1', description: 'The first command option'}),
					new Cli.Command({name: 'test2', description: 'The second command option'})
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
					new Cli.Command({name: 'test1', description: 'The first command option'}),
					new Cli.Command({name: 'test2', description: 'The second command option'})
				],
				required: true
			})
			.commandGroup({
				name: 'cmd2',
				description: 'secondary route for the program',
				commands: [
					new Cli.Command({name: 'testA', description: 'The first command option'}),
					new Cli.Command({name: 'testB', description: 'The second command option'})
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
					new Cli.Command({name: 'test1', description: 'The first command option'}),
					new Cli.Command({name: 'test2', description: 'The second command option'})
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
					new Cli.Command({
						name: 'test1', description: 'The first command option', callback: function (command) {
							resultCommand = command;
						}
					}),
					new Cli.Command({
						name: 'test2', description: 'The second command option', callback: function (command) {
							resultCommand = 'Hello World';
						}
					})
				],
				callback: function (command) {
					resultGroup = command;
				}.bind(this)
			})
			.parse(['node', 'cli-test.js', 'test1']);
		assert.equal(cli.params.cmd1, 'test1');
		assert.ok(resultCommand instanceof Cli.Command, 'resultCommand was not instance of Command');
		assert.equal(resultCommand.name, 'test1');
		assert.equal(resultGroup.name, 'test1');

		cli.parse(['node', 'cli-test.js', 'test2']);
		assert.equal(cli.params.cmd1, 'test2');
		assert.equal(resultCommand, 'Hello World');
		assert.equal(resultGroup.name, 'test2');
	});

	describe("Command Nesting", function() {

		it("Should make a tree of commands easily", function () {
			var cli = new Cli();

			var finalResult;
			cli
				.commandGroup({
					name: 'cmd1',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'test1',
							description: 'The first command option',
							callback: function (command) {
								// Append additional subgroups when this one is chosen.
								finalResult = 'bar'
							},
							subElements: [
								new Cli.Flag({
									name: 'hello',
									description: 'world',
									shortFlag: '-h',
									longFlag: '--hello'
								}),
								new Cli.Option({
									name: 'foo',
									description: 'foober',
									shortFlag: '-f',
									longFlag: '--foo',
									required: true
								})
							]
						}),
						new Cli.Command({
							name: 'test2',
							description: 'The second command option',
							callback: function (command) {
								finalResult = 'hello';
							},
							subElements: [
								new Cli.Flag({
									name: 'different',
									description: 'diff',
									shortFlag: '-d',
									longFlag: '--different'
								})
							]
						})
					],
					required: true
				});

			cli.parse(['node', 'cli-test.js', 'test1', '-f', 'bar', '--hello']);
			assert.equal(cli.params.cmd1, 'test1');
			assert.equal(cli.params.hello, true);
			assert.equal(cli.params.foo, 'bar');
			assert.equal(finalResult, 'bar');

			cli.parse(['node', 'cli-test.js', 'test2']);
			assert.equal(cli.params.cmd1, 'test2');
			assert.equal(cli.params.different, false);
			assert.equal(finalResult, 'hello');

			cli.parse(['node', 'cli-test.js', 'test2', '--different']);
			assert.equal(cli.params.cmd1, 'test2');
			assert.equal(cli.params.different, true);
			assert.equal(finalResult, 'hello');
		});

		it("Should process sub commands before triggering callback", function () {
			var cli = new Cli();

			var finalResult;
			cli
				.commandGroup({
					name: 'cmd1',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'test1',
							description: 'The first command option',
							callback: function (command) {
								// Append additional subgroups when this one is chosen.
								assert.equal(cli.params.hello, true);
								assert.equal(cli.params.foo, 'bar');
							},
							subElements: [
								new Cli.Flag({
									name: 'hello',
									description: 'world',
									shortFlag: '-h',
									longFlag: '--hello'
								}),
								new Cli.Option({
									name: 'foo',
									description: 'foober',
									shortFlag: '-f',
									longFlag: '--foo',
									required: true
								})
							]
						}),
						new Cli.Command({
							name: 'test2',
							description: 'The second command option',
							callback: function (command) {
								finalResult = 'hello';
							},
							subElements: [
								new Cli.Flag({
									name: 'different',
									description: 'diff',
									shortFlag: '-d',
									longFlag: '--different'
								})
							]
						})
					],
					required: true
				});

			cli.parse(['node', 'cli-test.js', 'test1', '-f', 'bar', '--hello']);
		});

		it("CommandGroup Nest", function () {
			var cli = new Cli();

			var finalResult;
			cli
				.commandGroup({
					name: 'greeting',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'hello',
							description: 'Who are we greeting?',
							callback: function (command) {
								// Append additional subgroups when this one is chosen.
								finalResult = 'bar'
							},
							subElements: [
								new Cli.CommandGroup({
									name: 'who',
									description: 'Greeting',
									commands: [
										new Cli.Command({
											name: 'world',
											description: 'our Earth'
										}),
										new Cli.Command({
											name: 'bro',
											description: 'a buddy'
										})
									]
								})
							]
						}),
						new Cli.Command({
							name: 'goodbye',
							description: 'The second command option',
							callback: function (command) {
								finalResult = 'hello';
							},
							subElements: [
								new Cli.Flag({
									name: 'different',
									description: 'diff',
									shortFlag: '-d',
									longFlag: '--different'
								})
							]
						})
					],
					required: true
				});

			cli.parse(['node', 'cli-test.js', 'hello', 'bro']);
			assert.equal(cli.params.greeting, 'hello');
			assert.equal(cli.params.who, 'bro');
		});

		it("Should make a tree of commands and keep throwing errors", function () {
			var cli = new Cli();

			var finalResult;
			cli
				.commandGroup({
					name: 'cmd1',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'test1',
							description: 'The first command option',
							callback: function (command) {
								// Append additional subgroups when this one is chosen.
								finalResult = 'bar'
							},
							subElements: [
								new Cli.Flag({
									name: 'hello',
									description: 'world',
									shortFlag: '-h',
									longFlag: '--hello'
								}),
								new Cli.Option({
									name: 'foo',
									description: 'foober',
									shortFlag: '-f',
									longFlag: '--foo',
									required: true
								})
							]
						}),
						new Cli.Command({
							name: 'test2',
							description: 'The second command option',
							callback: function (command) {
								finalResult = 'hello';
							},
							subElements: [
								new Cli.Flag({
									name: 'different',
									description: 'diff',
									shortFlag: '-d',
									longFlag: '--different'
								})
							]
						})
					],
					required: true
				});

			//Missing
			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', 'test1']);
			});

			assert.throws(function () {
				cli.parse(['node', 'cli-test.js', 'test2', 'extra']);
			});
		});

	});

	it("Should error on extra command", function () {
		var cli = new Cli();

		cli
			.commandGroup({
				name: 'cmd1',
				description: 'main route for the program',
				commands: [
					new Cli.Command({
						name: 'test1',
						description: 'The first command option'
					}),
					new Cli.Command({
						name: 'test2',
						description: 'The second command option'
					})
				]
			});

		assert.throws(function () {
			cli.parse(['node', 'cli-test.js', 'test3']);
		}, 'Didn\'t throw error for extra params as it should');
	});
});