var Cli = require('./../lib/cli'),
	CliError = require('./../lib/error/abstract-error'),
	Command = require('./../lib/command');

exports.testCommandBasic = function (test) {
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
	test.equal(cli.params.cmd1, 'test1');

	cli.parse(['node', 'cli-test.js', 'test2']);
	test.equal(cli.params.cmd1, 'test2');
	test.done();
}

exports.testCommandBasicMultiple = function (test) {
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
	test.equal(cli.params.cmd1, 'test1');
	test.equal(cli.params.cmd2, 'testB');
	test.done();
};

exports.testCommandMissing = function (test) {
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

	test.throws(function () {
		cli.parse(['node', 'cli-test.js', 'test3']);
	});
	test.done();
}

exports.testCommandCallbacks = function (test) {
	var cli = new Cli();

	var resultCommand = {};
	var resultGroup = {};
	cli
		.commandGroup({
            name: 'cmd1',
            description: 'main route for the program',
            commands: [
                new Command({name: 'test1', description: 'The first command option', callback: function (cli, command) {
                    resultCommand = command;
                }}),
                new Command({name: 'test2', description: 'The second command option', callback: function (cli, command) {
                    resultCommand = 'Hello World';
                }})
            ],
            callback: function (cli, command) {
                resultGroup = command;
            }.bind(this)
        })
		.parse(['node', 'cli-test.js', 'test1']);
	test.equal(cli.params.cmd1, 'test1');
	test.equal(resultCommand.name, 'test1');
	test.equal(resultGroup.name, 'test1');

	cli.parse(['node', 'cli-test.js', 'test2']);
	test.equal(cli.params.cmd1, 'test2');
	test.equal(resultCommand, 'Hello World');
	test.equal(resultGroup.name, 'test2');
	test.done();
};

exports.testExtraCommand = function(test) {
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

	test.throws(function () {
		cli.parse(['node', 'cli-test.js', 'test3']);
	});
	test.done();
};