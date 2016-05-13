<img src="https://cdn.rawgit.com/four43/admiral-cli/1dcce29a6a0b52d95f6522680ec3c2bfe50d52d5/docs/images/logo-1.svg" alt="Admiral-Cli" height="150px"/>

Admiral-CLI
===========
_A tool for Node.js to make applications easier to write, easier to use._

Admiral-CLI is a Command Line Framework (CLI) framework for Node.js. There are other CLI frameworks available for Node.js 
already, however Admiral adds validation and some callbacks in key places to make apps easier to write.
We wanted to create a framework with less configuration but stronger validation. 

Configuration should be easy to understand
while CLI parameters are strictly validated and appropriate error messages are passed on to the user. A CLI is a user interface,
let's treat it like one.

Master: 
[![Build Status](https://travis-ci.org/four43/admiral-cli.svg?branch=master)](https://travis-ci.org/four43/admiral-cli)
[![Coverage Status](https://coveralls.io/repos/four43/admiral-cli/badge.svg?branch=master&service=github)](https://coveralls.io/github/four43/admiral-cli?branch=master)

Dependencies: [![Dependency Status](https://david-dm.org/four43/admiral-cli.svg)](https://david-dm.org/four43/admiral-cli)
[![devDependency Status](https://david-dm.org/four43/admiral-cli/dev-status.svg)](https://david-dm.org/four43/admiral-cli#info=devDependencies)


Development: [![Build Status](https://travis-ci.org/four43/admiral-cli.svg?branch=development)](https://travis-ci.org/four43/admiral-cli)

__This project sponsored in part by:__

[![AerisWeather](http://branding.aerisweather.com/logo-dark-small.png)](http://www.aerisweather.com) - Empowering the next generation, [aerisweather.com](https://www.aerisweather.com)

## Installation

[![NPM](https://nodei.co/npm/admiral-cli.png?downloads=true&stars=true)](https://nodei.co/npm/admiral-cli/)

Available via npm.

```
npm install --save admiral-cli
```

Tested on NodeJS: `v5`, `v4.1`, `v0.12` and `iojs`. See .travis.yml for more info.

## Usage

Quick Example:

```javascript
var Cli = require('admiral-cli'),

var cli = new Cli();
cli
    // Command Groups are for fixed options, like 'commit' and 'checkout' in git
    .commandGroup({
        name: 'cmd',
        description: 'Commands are single words, no - or --s, and are one of the following:',
        commands: [
            new CliCommand({
                name: 'add',
                description: 'The variable cmd will be set to add in this case',
                callback: function (command) {
                    var doSome = 'stuff';
                }
            }),
            new CliCommand({
                name: 'another',
                description: 'A user could also specify another'
            })
        ],
        callback: function commandLevelCallback(command) {
            var theCommandObjThatWasChosen = command;
        },
        required: true
    })
    // Flags are for true/false switches
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
    // Options are two parts, a key and a user supplied value.
    .option({
        name: 'optName',
        description: 'Options are two parts, a key and a user supplied value',
        shortFlag: '-o',
        longFlag: '--option',
        type: 'string',
        length: 1
        required: true
    });

//Parse Cli arguments
try {
    cli.parse();
}
catch (error) {
    console.error(error);
    if (error instanceof Cli.InvalidInputError) {
        // User input something wrong, will display help by default.
        process.exit(2);
    }
    else if (error instanceof Cli.ConfigError) {
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

### Commands and Command Groups
A Command Group is a collection of possible Commands. One command can be chosen by the user at a time, per Command Group. Multiple
command groups can be added at a time, but order matters.

For example: `git push origin` One command group would be added
for `push` (and other top level commands like `commit` and `pull`), then another command group added for the remotes `origin`, `home-server`, etc.

#### Command Group Options:

| Option        | Type (default)  | Description                                                                                               |
|---------------|-----------------|-----------------------------------------------------------------------------------------------------------|
| `name`        | String (null)   | Name of the Command Group, used for validation messages                                                   |
| `description` | String (null)   | Description of this Command Group, used for help text.                                                    |
| `commands`    | Commands[] ([]) | The set of possible Commands                                                                              |
| `required`    | Boolean (true)  | This command is required, one of the Commands must be passed.                                             |
| `callback`    | Function (null) | A callback to call when a command from this command group is parsed, function([Cli], [Command]) |

#### Command Options:

| Option        | Type (default)  | Description                                                                                               |
|---------------|-----------------|-----------------------------------------------------------------------------------------------------------|
| `name`        | String (null)   | Name of the Command, used when parsing, so `push` or `commit` from the example above.                     |
| `description` | String (null)   | Description of this Command, used for help text.                                                          |
| `callback`    | Function (null) | A callback to call when a command from this command group is parsed, function([Cli], [Command]) |

Creating a tree structure for command routing isn't hard, just add more `CommandGroup`s to the first argument (the base Cli) in the callback

```javascript
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
                callback: function(command) {
                    // Append additional subgroups when this one is chosen.
                    cli.commandGroup({
                        name: 'test1Sub',
                        description: 'the sub command to test1',
                        commands: [
                            new Command({
                                name: 'foo',
                                description: 'Foo should equal bar',
                                callback: function(command) {
                                    finalResult = 'bar';
                                }
                            })
                        ],
                        required: true
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
    
// Calling with: `node ./my-script.sh test1 foo` will set `finalResult` to 'bar'
// The script will also be able to be called with `node ./my-script.sh test2`
```


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

#### Flag Options:

| Option        | Type (default)  | Description                                                                              |
|---------------|-----------------|------------------------------------------------------------------------------------------|
| `name`        | String (null)   | Name of the Flag, used for invalid messages and help text.                               |
| `description` | String (null)   | Description of this Flag, used for help text.                                            |
| `shortFlag`   | String (null)   | A string starting with "-" and a single character, the shortened flag a user may pass.   |
| `longFlag`    | String (null)   | A string starting with "--" and any number of characters, the long flag a user may pass. |
| `value`       | any (true)      | The value to assign the resulting output when the flag is passed, defaults to `true`     |


### Option
Options are key/value pairs, e.g. -n myName. They can be in any order. The have both a short and long version, much like
flags, but they require a value after them.

#### Option Options (ha):

| Option        | Type (default)    | Description                                                                              |
|---------------|-------------------|------------------------------------------------------------------------------------------|
| `name`        | String (null)     | Name of the Option, used for invalid messages and help text. |
| `description` | String (null)     | Description of this Option, used for help text. |
| `shortFlag`   | String (null)     | A string starting with "-" and a single character, the shortened flag a user may pass denoting the next value will be the value(s) of this option.   |
| `longFlag`    | String (null)     | A string starting with "--" and any number of characters, the long flag a user may pass denoting the next value will be the value(s) of this option. |
| `type `       | String ("string") | The type of this option, `int` and `float`/`double`s will be parsed accordingly and error if they do not match the provided type.  `path`s will be turned into absolute paths using the cwd.  |
| `length`      | Integer (1)       | How many space separated arguments are required. -1 is any number (will parse until another flag or command is hit, will return an array) , 1 is a single value, >1 is a fixed number (will return an array)    |
| `required`    | Boolean (true)    | This Option is required, this Option must be provided. |
| `default`     | * (undefined)   | If this Option isn't required, a default value can be set that will be used in place of a user provided value. |

### EnvVar
For parsing Environment Variables. Will verify an environment variable with a certain name was provided and will parse/validate it to
the desired type.

#### EnvVar Options:

| Option        | Type (default)    | Description                                                                              |
|---------------|-------------------|------------------------------------------------------------------------------------------|
| `name`        | String (null)     | Name of the EnvVar, the key of the element in process.env, "HELLO_WORLD" for example. |
| `description` | String (null)     | Description of this EnvVar, used for help text. |
| `type `       | String ("string") | The type of this EnvVar, `int` and `float`/`double`s will be parsed accordingly and error if they do not match the provided type.    |
| `required`    | Boolean (true)    | This EnvVar is required, this EnvVar must be provided. |

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
