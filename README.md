Admiral-CLI
===========

A Command Line Framework (CLI) framework for Node.js. There are a CLI frameworks available for Node.js already. Admiral
has features like other CLI frameworks, but adds validation and some callbacks in key places. We wanted to create one
with less configuration but stronger validation.

##Usage

Quick Example:

```javascript
var cli = require('cli'),
	CliInvalidInputError = require('cli').InvalidInputError,
	CliConfigError = require('cli').ConfigError;

cli
	.commandGroup('cmd', 'Commands are single words, no - or --s, and are one of the following:', [
			new Command('add', 'The variable cmd will be set to add in this case', function(cli, command) { var do = 'stuff'; }),
			new Command('another', 'A user could also specify another')
		],
		function commandLevelCallback(cli, command) {
			var theCommandObjThatWasChosen = command;
		},
		true //Required
	)
	.flag('flagName', 'Flags are single phrases, set as a boolean', '-f', '--flag')
	.flag('nonPassed', 'Flags that aren\'t passed are set as false', '-n', '--non')
	.option('optName', 'Options are two parts, a key and a user supplied value', '-o', '--option', 'string', true);

//Parse Cli arguments
try {
	cli.parse();
}
catch(error) {
	console.error(error);
	if(error instanceof CliInvalidInputError) {
		process.exit(2);
	}
	else if(error instanceof CliConfigError) {
		console.error('Doh, configured something wrong.', error);
		process.exit(1);
	}
}
//Could call script with cliExample.js add --option myExample -f
//cli.params would be { 'cmd': 'add', 'flagName': true, 'nonPassed': false, 'optName': 'myExample' }
```

This library should be quite tested, make sure to check out the tests directory for other examples.

###parse() and Params
The `parse()` method parses the command line arguments (or a passed array) with the configured, command groups, flags,
and options. This will set the Cli object's params object with keys of the configured properties and the passed variables.

Currently ConfigError errors will be thrown if something is wrong when creating the Cli object. InvalidInput options
will be thrown if a parameter isn't passed and is required, also if there is an extra parameter that is passed but wasn't
configured.

###Command Group
A container that holds commands. One command can be chosen by the user at a time, per Command Group. Multiple
command groups can be added at a time, but order matters.

For example: `git push origin` One command group would be added
for `push` (and other top level commands), then another command group added for `origin`.

###Flag
A flag is a single phrase that is set as a boolean and can be passed in any order. Flags that aren't passed are set as false.

For example: `rm -f` would use the `short` property of the flag, force. So force could be defined as:
```javascript
cli.flag('force', 'Force removes things, for real', '-f', '--force');
```
Would also allow `rm --force`

Flags can be combined, like `rm -rf` and options `force` (defined with '-f') and `recursive` (defined with -r) would
both be true.

###Option
Options are key/value pairs, e.g. -n myName. They can be in any order. The have both a short and long version, much like
flags, but they require a value after them.

---

##Development

###Ideas from:

* Chriso's great CLI framework (https://github.com/chriso/cli)
* Visionmedia's JS port of Ruby's Commander (https://github.com/visionmedia/commander.js)

###Goals:

* Commands
	* Provide events for command based routing, e.g. git pull origin development
    * Auto-complete on commands (Phase 2)
* Options
	* Short and long options, e.g. ssh -i ~/key-file.pem
	* Description
	* Required
	* Validation
* Flags
	* Allow for single flags, e.g. rm -f
	* Combined flags, e.g. rm -rf
* Order
	* Allow any order for flags and options, but order for commands.
* Errors
	* InvalidInput Errors
	* Configuration Errors