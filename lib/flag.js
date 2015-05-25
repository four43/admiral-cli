#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter'),
	Cli = require('./cli'),
    debug = require('debug')('Flag'),
    helpers = require('./helpers'),
    util = require('util');

    ConfigError = require('./error/config'),
    InvalidInputError = require('./error/invalid-input');

/**
 * Flag
 *
 * A flag is a single phrase that is set as a boolean. Flags that aren't passed are set as false.
 *
 * Options:
 *
 *  * name Name of the flag, it will be stored as cli.params.[name]
 *  * [description] Description of the flag. Used in help text.
 *  * short Short version of the flag, starts with '-' and is one more character.
 *  * [long] The long version of the flag, starts with '--' and is one or more characters.
 *  * [value] The value to set the variable to if this flag is passed. Defaults to true.
 *
 * @param {{name, [description], short, [long], [value]}} options
 *
 * @constructor
 */
function Flag(options) {
    var defaults = {
        name: null,
        description: null,
        shortFlag: null,
        longFlag: null,
        value: true
    };
    this.options = helpers.merge(defaults, options);

	AbstractParameter.call(this, this.options.name, this.options.description);

	if (this.options.shortFlag != null && (this.options.shortFlag.length != 2 || this.options.shortFlag[0] !== '-')) {
		throw new InvalidInputError("The flag: " + this.options.name + "'s short property must start with a '-' and be one more character.");
	}

	if (this.options.longFlag != null && (this.options.longFlag.length <= 2 || this.options.longFlag.substr(0, 2) !== '--')) {
		throw new InvalidInputError("The flag: " + this.options.name + "'s long property must start with '--' and be one or more character");
	}
}
util.inherits(Flag, AbstractParameter);

/**
 *
 * @param {Array} args
 * @param {Flag[]} flags
 * @param {boolean} verbose
 * @param {boolean} help
 * @param {function} helpTextCallback Call this if we find help flag
 * @returns {*}
 */
Flag.parse = function (args, flags, verbose, help, helpTextCallback) {
    var params = {};

    flags = helpers.deepCopy(flags);
    if(verbose) {
        //Add flags for verbose.
        flags.push(new Flag({
            name: 'verbose',
            description: 'The verbosity level of the application',
            shortFlag: '-v',
            longFlag: '--verbose',
            value: 1
        }));
    }

    if(help) {
        flags.push(new Flag({
            name: 'help',
            description: 'Display the help text',
            longFlag: '--help'
        }));
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i],
            flag;
        if (arg.match(/^\-\-/)) {
            //Long version flags --
            debug("Flag(s) (Long version) found: " + arg);
            flag = findFlag(arg, flags);
            if (flag) {
                params[flag.options.name] = flag.options.value;
                args.splice(i, 1);
                i--;
            }
            else {
                throw new ConfigError("Flag '" + arg + "' is unknown");
            }
        }
        else if (arg[0] == "-") {
            //Short version flags -
            debug("Flag(s) found: " + arg);
            arg = arg.substr(1);
            for (var j = 0; j < arg.length; j++) {
                flag = findFlag('-' + arg[j], flags);
                if (flag) {
                    if(params.hasOwnProperty(flag.options.name) && !isNaN(params[flag.options.name]) && !isNaN(flag.options.value)) {
                        params[flag.options.name] += flag.options.value;
                    }
                    else {
                        params[flag.options.name] = flag.options.value;
                    }
                }
                else {
                    throw new InvalidInputError("Flag '" + arg + "' is unknown");
                }
            }
            args.splice(i, 1);
            i--;
        }

        if(flag && flag.options.name === 'help') {
            return helpTextCallback();
        }
    }
    //Set all other registered flags to false
    flags.forEach(function (flag) {
        if (!params.hasOwnProperty(flag.options.name)) {
            params[flag.options.name] = false;
        }
    }.bind(this));
    return params;
};

/**
 * Find Flag
 *
 * Given a `key` that represents the long or short version of a flag, return the flag object from `flags`
 * @param {String} key The needle, the long or short string that represents a flag.
 * @param {Flag[]} flags
 * @returns {*}
 * @private
 */
function findFlag(key, flags) {
    debug('findFlag: ' + key);
    for (var i = 0; i < flags.length; i++) {
        var flag = flags[i];
        if (flag.options.shortFlag == key || flag.options.longFlag == key) {
            debug('Flag found!', flag);
            return flag;
        }
    }
    debug('returning null');
    return null;
};

module.exports = Flag;