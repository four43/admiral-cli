var fs = require('fs'),
	Cli = require('./../lib/cli'),
	Command = require('./../lib/command');

exports.helpTextCommand = function (test) {
	var cli = new Cli();
	cli
		.commandGroup(
			'cmd1',
			'main route for the program', [
				new Command('test1', 'The first command option'),
				new Command('test2', 'The second command option')
			],
			null,
			true
		)
		.commandGroup(
			'anotherCmd',
			'Secondary command, changes the output of the thing', [
				new Command('t1', 'To test the first bit'),
				new Command('t2', 'To test the second bit')
			],
			null,
			true
		);
	hookStdout();
	cli.parse(['node', 'cli-test.js']);
	unhookStdout();

	console.log(stdOutBuffer);
	var expected = fs.readFileSync(__dirname + '/outputs/helpTextCommand.txt', 'utf8');
	test.equal(stdOutBuffer, expected);

	test.done();
};

exports.helpTextFlags = function (test) {
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
	test.equal(stdOutBuffer, expected);

	test.done();
};

exports.helpTextOptions = function (test) {
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
	test.equal(stdOutBuffer, expected);

	test.done();
};


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