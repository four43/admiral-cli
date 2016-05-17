var assert = require('assert'),
	fs = require('fs'),
	Cli = require('./../main');

describe("Cli", function () {
	var processExitOrig, exitCode = null;

	beforeEach(function() {
		processExitOrig = process.exit;
		process.exit = function(code) { exitCode = code; }
	});

	afterEach(function() {
		exitCode = null;
		process.exit = processExitOrig;
	});

	describe("Help Text", function () {
		it("Should display help text by default", function () {
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
					name: 'anotherCmd',
					description: 'Secondary command, changes the output of the thing',
					commands: [
						new Cli.Command({name: 't1', description: 'To test the first bit'}),
						new Cli.Command({name: 't2', description: 'To test the second bit'})
					],
					required: true
				})
				.flag({
					name: 'flag1',
					description: 'Just a test flag',
					shortFlag: '-t',
					longFlag: '--test1'
				})
				.option({
					name: 'option1',
					description: 'Just a test opt',
					shortFlag: '-o',
					longFlag: '--opt'
				})
				.flag({
					name: 'flag2',
					description: 'Another test flag',
					shortFlag: '-u',
					longFlag: '--test2'
				});
			hookStdout();
			cli.parse(['node', 'cli-test.js']);
			unhookStdout();

			console.log(stdOutBuffer);
			var expected = fs.readFileSync(__dirname + '/outputs/helpTextCommand.txt', 'utf8');
			assert.equal(stdOutBuffer, expected);
		});

		it("Should display flag help with --help flag", function () {
			var cli = new Cli();
			cli
				.flag({
					name: 'flag1',
					description: 'Just a test opt',
					shortFlag: '-t',
					longFlag: '--test1'
				})
				.flag({
					name: 'flag2',
					description: 'Just another test opt',
					shortFlag: '-a'
				})
				.flag({
					name: 'flag3',
					description: 'The last test opt',
					longFlag: '--muchLongerFlagName'
				});

			hookStdout();
			cli.parse(['node', 'cli-test.js', '--help']);
			unhookStdout();

			var expected = fs.readFileSync(__dirname + '/outputs/helpTextFlags.txt', 'utf8');
			assert.equal(stdOutBuffer, expected);
		});

		it("Should display options help with --help flag", function () {
			var cli = new Cli();
			cli
				.option({
					name: 'option1',
					description: 'Just a test opt',
					shortFlag: '-t',
					longFlag: '--test1'
				})
				.option({
					name: 'opt2',
					description: 'Just another test opt',
					shortFlag: '-a'
				})
				.option({
					name: 'optB',
					description: 'The last test opt',
					longFlag: '--last'
				});

			hookStdout();
			cli.parse(['node', 'cli-test.js', '--help']);
			unhookStdout();

			var expected = fs.readFileSync(__dirname + '/outputs/helpTextOptions.txt', 'utf8');
			assert.equal(stdOutBuffer, expected);
		});

		it("Should exit on help (no args)", function() {
			var cli = new Cli()
				.option({
					name: 'foo',
					description: 'foo (defaults to bar)',
					shortFlag: '-f',
					longFlag: '--foo',
					required: true
				});

			cli.parse(['node', 'cli-test.js']);

			assert.strictEqual(exitCode, 3);
		});

		it("Should exit on --help flag", function() {
			var cli = new Cli()
				.option({
					name: 'foo',
					description: 'foo (defaults to bar)',
					shortFlag: '-f',
					longFlag: '--foo',
					required: true
				});

			cli.parse(['node', 'cli-test.js', '--help']);

			assert.strictEqual(exitCode, 3);
		});

		it("Should not exit on --help flag, when exitOnHelp=false", function() {
			var cli = new Cli({ exitOnHelp: false })
				.option({
					name: 'foo',
					description: 'foo (defaults to bar)',
					shortFlag: '-f',
					longFlag: '--foo',
					required: true
				});

			cli.parse(['node', 'cli-test.js', '--help']);

			assert.strictEqual(exitCode, null, 'should not have exited process');
		});

		it("Should display deep nested help text", function () {
			var cli = new Cli();
			cli
				.commandGroup({
					name: 'cmd1',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'test1',
							description: 'The first command option',
							subElements: [
								new Cli.CommandGroup({
									name: 'test1Nested',
									description: 'Another set of commands',
									commands: [
										new Cli.Command({
											name: 'A',
											description: 'The first choice'
										}),
										new Cli.Command({
											name: 'B',
											description: 'The second choice'
										})
									]
								})
							]
						}),
						new Cli.Command({name: 'test2', description: 'The second command option'})
					],
					required: true
				})
				.commandGroup({
					name: 'anotherCmd',
					description: 'Secondary command, changes the output of the thing',
					commands: [
						new Cli.Command({name: 't1', description: 'To test the first bit'}),
						new Cli.Command({name: 't2', description: 'To test the second bit'})
					],
					required: true
				});
			hookStdout();
			cli.parse(['node', 'cli-test.js']);
			unhookStdout();

			console.log(stdOutBuffer);
			var expected = fs.readFileSync(__dirname + '/outputs/helpTextNestedCommand.txt', 'utf8');
			assert.equal(stdOutBuffer, expected);
		});

		it("Should display deep nested help text - Flags, Options", function () {
			var cli = new Cli();
			cli
				.commandGroup({
					name: 'cmd1',
					description: 'main route for the program',
					commands: [
						new Cli.Command({
							name: 'test1',
							description: 'The first command option',
							subElements: [
								new Cli.CommandGroup({
									name: 'test1Nested',
									description: 'Another set of commands',
									commands: [
										new Cli.Command({
											name: 'A',
											description: 'The first choice',
											subElements: [
												new Cli.Flag({
													name: 'Force',
													description: 'Make it go',
													shortFlag: '-f',
													longFlag: '--force'
												})
											]
										}),
										new Cli.Command({
											name: 'B',
											description: 'The second choice'
										})
									]
								})
							]
						}),
						new Cli.Command({name: 'test2', description: 'The second command option'})
					],
					required: true
				})
				.commandGroup({
					name: 'anotherCmd',
					description: 'Secondary command, changes the output of the thing',
					commands: [
						new Cli.Command({name: 't1', description: 'To test the first bit'}),
						new Cli.Command({name: 't2', description: 'To test the second bit'})
					],
					required: true
				});
			hookStdout();
			cli.parse(['node', 'cli-test.js']);
			unhookStdout();

			console.log(stdOutBuffer);
			var expected = fs.readFileSync(__dirname + '/outputs/helpTextNestedOther.txt', 'utf8');
			assert.equal(stdOutBuffer, expected);
		});
	});
});


/**
 * Stdout overwrite
 */
var oldWrite;
var stdOutBuffer = '';

function hookStdout() {
	stdOutBuffer = '';
	oldWrite = process.stdout.write;
	process.stdout.write = function (str) {
		stdOutBuffer += str;
	}.bind(this);
}

function unhookStdout() {
	process.stdout.write = oldWrite;
}

hookStdout();
console.log('Captured');
unhookStdout();
console.log("Buffer Test: " + stdOutBuffer);