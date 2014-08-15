var fs = require('fs'),
	Cli = require('./../lib/cli'),
	Command = require('./../lib/command');

exports.testMergeSimple = function (test) {
	var a = {
		hello: 'world'
	}
	var b = {
		foo: 'bar'
	}
	var expected = {
		hello: 'world',
		foo: 'bar'
	}
	var result = Cli._merge(a, b);
	test.deepEqual(result, expected);
	test.done();
}

exports.testMergeOverwrite = function (test) {
	var a = {
		hello: 'world'
	}
	var b = {
		hello: 'bar'
	}
	var expected = {
		hello: 'bar'
	}
	var result = Cli._merge(a, b);
	test.deepEqual(result, expected);
	test.done();
}

exports.testMergeDeepOverwrite = function (test) {
	var a = {
		option1: {
			subOpt1: 'hello'
		}
	}
	var b = {
		option1: 'bar'
	}
	var expected = {
		option1: 'bar'
	}
	var result = Cli._merge(a, b);
	test.deepEqual(result, expected);
	test.done();
}

exports.testMergeDeep = function (test) {
	var a = {
		option1: {
			subOpt1: 'hello'
		}
	}
	var b = {
		option1: {
			subOpt2: 'hi'
		}
	}
	var expected = {
		option1: {
			subOpt1: 'hello',
			subOpt2: 'hi'
		}
	}
	var result = Cli._merge(a, b);
	test.deepEqual(result, expected, 'testMergeDeep didn\'t work');
	test.done();
}

exports.testMergeSuperDeep = function (test) {
	var a = {
		a: {
			a1: 'hello',
			a2: true
		},
		b: {
			b1: {
				b1a: false,
				b1b: 'foo'
			}
		}
	}
	var b = {
		a: {
			a1: 'h1'
		},
		b: {
			b1: {
				b1a: true
			}
		},
		c: {
			c1: {
				c1a: 'bar'
			}
		}
	}
	var expected = {
		a: {
			a1: 'h1',
			a2: true
		},
		b: {
			b1: {
				b1a: true,
				b1b: 'foo'
			}
		},
		c: {
			c1: {
				c1a: 'bar'
			}
		}
	}
	var result = Cli._merge(a, b);
	test.deepEqual(result, expected, 'testMergeDeep didn\'t work');
	test.done();
}

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
	cli.parse(['cli-test.js']);
	unhookStdout();

	console.log(stdOutBuffer);
	var expected = fs.readFileSync(__dirname + '/outputs/helpTextCommand.txt', 'utf8');
	test.equal(stdOutBuffer, expected);

	test.done();
}

exports.helpTextFlags = function (test) {
	var cli = new Cli();
	cli
		.flag('flag1', 'Just a test opt', '-t', '--test1')
		.flag('flag2', 'Just another test opt', '-a')
		.flag('flag3', 'The last test opt', null, '--muchLongerFlagName');

	hookStdout();
	cli.parse(['cli-test.js', '--help']);
	unhookStdout();

	var expected = fs.readFileSync(__dirname + '/outputs/helpTextFlags.txt', 'utf8');
	test.equal(stdOutBuffer, expected);

	test.done();
}

exports.helpTextOptions = function (test) {
	var cli = new Cli();
	cli
		.option('option1', 'Just a test opt', '-t', '--test1')
		.option('opt2', 'Just another test opt', '-a')
		.option('optB', 'The last test opt', null, '--last');

	hookStdout();
	cli.parse(['cli-test.js', '--help']);
	unhookStdout();

	var expected = fs.readFileSync(__dirname + '/outputs/helpTextOptions.txt', 'utf8');
	test.equal(stdOutBuffer, expected);

	test.done();
}


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