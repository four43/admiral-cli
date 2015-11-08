var assert = require('assert'),
	fs = require('fs'),
	Cli = require('./../lib/Cli'),
	Command = require('./../lib/Command');

describe("Cli", function () {
	describe("Help Text", function () {
		it("Should display help text by default", function () {
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
					name: 'anotherCmd',
					description: 'Secondary command, changes the output of the thing',
					commands: [
						new Command({name: 't1', description: 'To test the first bit'}),
						new Command({name: 't2', description: 'To test the second bit'})
					],
					required: true
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