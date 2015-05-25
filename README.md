<img src="https://cdn.rawgit.com/four43/admiral-cli/1dcce29a6a0b52d95f6522680ec3c2bfe50d52d5/docs/images/logo-1.svg" alt="Admiral-Cli" style="height:150px"/>

Admiral-CLI
===========
_A tool for Node.js to make applications easier to write, easier to use._

Admiral-CLI is a Command Line Framework (CLI) framework for Node.js. There are other CLI frameworks available for Node.js 
already, however Admiral adds validation and some callbacks in key places to make apps easier to write.
We wanted to create a framework with less configuration but stronger validation. 

Configuration should be easy to understand
while CLI parameters are strictly validated and appropriate error messages are passed on to the user. A CLI is a user interface,
let's treat it like one.

Master: [![Build Status](https://travis-ci.org/four43/admiral-cli.svg?branch=master)](https://travis-ci.org/four43/admiral-cli)

Dependencies: [![Dependency Status](https://david-dm.org/four43/admiral-cli.svg)](https://david-dm.org/four43/admiral-cli)
[![devDependency Status](https://david-dm.org/four43/admiral-cli/dev-status.svg)](https://david-dm.org/four43/admiral-cli#info=devDependencies)


Development: [![Build Status](https://travis-ci.org/four43/admiral-cli.svg?branch=development)](https://travis-ci.org/four43/admiral-cli)

## Installation

[![NPM](https://nodei.co/npm/admiral-cli.png?downloads=true&stars=true)](https://nodei.co/npm/admiral-cli/)

Available via npm.

```
npm install --save admiral-cli
```

## Usage

Quick Example:

```javascript
var Cli = require('admiral-cli'),
    CliCommand = require('admiral-cli').Command,
	CliInvalidInputError = require('admiral-cli').InvalidInputError,
	CliConfigError = require('admiral-cli').ConfigError;

var cli = new Cli();
cli
	.commandGroup({
	    name: 'cmd', 
	    description: 'Commands are single words, no - or --s, and are one of the following:', 
	    commands: [
			new CliCommand({
			    name: 'add', 
			    description: 'The variable cmd will be set to add in this case', 
			    callback: function(cli, command) { var do = 'stuff'; 
			}),
			new CliCommand({
			    name: 'another', 
			    description: 'A user could also specify another'
			})
		],
		callback: function commandLevelCallback(cli, command) {
			var theCommandObjThatWasChosen = command;
		},
		required: true
	)
	.flag({
	    name: 'flagName', 
	    description: 'Flags are single phrases, set as a boolean', 
	    shortFlag: '-f', 
	    longFlag: '--flag'
    })
	.flag({
	    name: 'notPassed', 
	    description: "Flags that aren't passed are set as false", 
	    shortFlag: '-n', 
	    longFlag: '--notPassed'
    })
	.option({
	    name: 'optName', 
	    description: 'Options are two parts, a key and a user supplied value', 
	    shortFlag: '-o', 
	    longFlag: '--option', 
	    type: 'string', 
	    length: '+'
	});

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

This library is well tested, make sure to check out the tests directory for other examples.

### CLI Options

There are some options for configuring Admiral-Cli that may be passed to the constructor.

| Option           | Type (default)  | Description                                                                                                          |
|------------------|-----------------|----------------------------------------------------------------------------------------------------------------------|
| `scriptName`     | String (null)   | The name of CLI script, this is automatically parsed, but use this as an override. Used in displaying documentation. |
| `verboseEnabled` | Boolean (true)  | Automatically parse `-v`, `-vv`, `-vvv`, and `--verbose`                                                             |
| `helpEnabled`    | Boolean (true)  | Enable help text output when passing `--help`                                                                        |
| `helpOnNoArgs`   | Boolean (true)  | Enable help text when no arguments are passed                                                                        |
| `exitOnHelp`     | Boolean (true)  | Exit after help is run.                                                                                              |
| `allowExtraArgs` | Boolean (false) | If the script should allow extra arguments, throws InvalidInput error by default.                                    |

Pass these options as an object to the constructor:

```javascript
var Cli = require('cli');

var cli = new Cli({
	scriptName: 'theNextBigThing.js',
	verboseEnabled: true
});
```

### parse() and Params
The `parse()` method parses the command line arguments (or a passed array) with the configured, command groups, flags,
and options. This will set the Cli object's params object with keys of the configured properties and the passed variables.

Currently ConfigError errors will be thrown if something is wrong when creating the Cli object. InvalidInput options
will be thrown if a parameter isn't passed and is required, also if there is an extra parameter that is passed but wasn't
configured.

### Command Group
A container that holds commands. One command can be chosen by the user at a time, per Command Group. Multiple
command groups can be added at a time, but order matters.

For example: `git push origin` One command group would be added
for `push` (and other top level commands), then another command group added for `origin`.

### Flag
A flag is a single phrase that is set as a boolean and can be passed in any order. Flags that aren't passed are set as false.

For example: `rm -f` would use the `short` property of the flag, force. So force could be defined as:
```javascript
cli.flag({
    name: 'force', 
    description: 'Force removes things, for real', 
    shortFlag: '-f', 
    longFlag: '--force'
});
```
Would also allow `rm --force`

Flags can be combined, like `rm -rf` and options `force` (defined with '-f') and `recursive` (defined with -r) would
both be true.

### Option
Options are key/value pairs, e.g. -n myName. They can be in any order. The have both a short and long version, much like
flags, but they require a value after them.

---

## Development

Latest feelings:

 * Verbose configuration is good. It takes a little longer to type, but it is so much more understandable later. After not
 touching the cli params parsing stuff for an app after a while, the old way of doing arguments got confusing.
 
 
### Ideas from:

* Chriso's great CLI framework (https://github.com/chriso/cli)
* Visionmedia's JS port of Ruby's Commander (https://github.com/visionmedia/commander.js)

### Goals:

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

### Contributing
Please feel free to contribute in any way. Feature requests with use cases, bug reports, forks and code
contributions are all welcome.
