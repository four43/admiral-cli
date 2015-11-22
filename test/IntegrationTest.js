var assert = require('assert'),
    Cli = require('./../lib/Cli'),
    Command = require('./../lib/Command'),
    CliError = require('./../lib/error/abstract-error'),
    CliInvalidInputError = require('./../lib/error/invalid-input');

describe("Integration", function () {

    describe("Verbosity", function () {
        it("Should set verbose to 0 by default", function () {
            var cli = new Cli({helpOnNoArgs: false});
            cli.parse(['node', 'test.js']);
            assert.equal(cli.params.verbose, 0);
        });

        it("Should set verbose to 1 with a single -v", function () {
            var cli = new Cli();
            cli.parse(['node', 'test.js', '-v']);
            assert.equal(cli.params.verbose, 1);
        });

        it("Should set verbosity to 2 with -vv", function () {
            var cli = new Cli();
            cli.parse(['node', 'test.js', '-vv']);
            assert.equal(cli.params.verbose, 2);
        });

        it("Should set verbosity to 3 with -vvv", function () {
            var cli = new Cli();
            cli.parse(['node', 'test.js', '-vvv']);
            assert.equal(cli.params.verbose, 3);
        });

        it("Should set verbosity to 1 with longFlag", function () {
            var cli = new Cli();
            cli.parse(['node', 'test.js', '--verbose']);
            assert.equal(cli.params.verbose, 1);
        });

        it("Should error when setting verbose without verbose configured", function () {
            var cli = new Cli({verboseEnabled: false});
            assert.throws(function () {
                cli.parse(['node', 'test.js', '-v']);
            });
        });
    });


    it("Should test multiple (git style)", function () {
        var cli = new Cli();
        cli
            .commandGroup({
                name: 'cmd',
                description: 'The primary command group',
                commands: [
                    new Command({name: 'push', description: 'Push up to the remote'}),
                    new Command({name: 'pull', description: 'Pull from the upstream'})
                ],
                required: true
            })
            .flag({
                name: 'force',
                description: 'Force the command to execute',
                shortFlag: '-f',
                longFlag: '--force'
            })
            .option({
                name: 'remote',
                description: 'The remote repo to push to',
                shortFlag: '-r',
                longFlag: '--remote',
                type: 'string'
            })
            .parse(['node', 'test.js', 'push', '-f', '-r', 'origin']);
        assert.equal(cli.params.cmd, 'push');
        assert.equal(cli.params.force, true);
        assert.equal(cli.params.remote, 'origin');
    });

    describe("Extra Arguments", function () {
        it("Should error with too many arguments", function () {
            var cli = new Cli();
            cli
                .commandGroup({
                    name: 'cmd',
                    description: 'The primary command group',
                    commands: [
                        new Command({name: 'push', description: 'Push up to the remote'}),
                        new Command({name: 'pull', description: 'Pull from the upstream'})
                    ],
                    required: true
                })
                .flag({
                    name: 'force',
                    description: 'Force the command to execute',
                    shortFlag: '-f',
                    longFlag: '--force'
                })
                .option({
                    name: 'remote',
                    description: 'The remote repo to push to',
                    shortFlag: '-r',
                    longFlag: '--remote',
                    type: 'string'
                });

            assert.throws(function () {
                cli.parse(['node', 'test.js', 'push', '-f', '-r', 'origin', '-h', 'world']);
            }, CliInvalidInputError, 'Error should be thrown when there are too many arguments (default behavior)');
        });

        it("Should not error when extra arguments is set to okay", function () {
            var cli = new Cli({
                allowExtraArgs: true
            });
            cli
                .commandGroup({
                    name: 'cmd',
                    description: 'The primary command group',
                    commands: [
                        new Command({name: 'push', description: 'Push up to the remote'}),
                        new Command({name: 'pull', description: 'Pull from the upstream'})
                    ]
                })
                .flag({
                    name: 'force',
                    description: 'Force the command to execute',
                    shortFlag: '-f',
                    longFlag: '--force',
                    required: false
                })
                .option({
                    name: 'remote',
                    description: 'The remote repo to push to',
                    shortFlag: '-r',
                    longFlag: '--remote',
                    type: 'string',
                    required: false
                })
                .parse(['node', 'test.js', 'push', '-f', '-r', 'origin']);
            assert.equal(cli.params.cmd, 'push');
            assert.equal(cli.params.force, true);
            assert.equal(cli.params.remote, 'origin');
        })
    });
});