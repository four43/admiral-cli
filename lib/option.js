#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter'),
    debug = require('debug')('Option'),
    helpers = require('./helpers'),
    util = require('util');
    //Error Types
    InvalidInputError = require('./error/invalid-input');

/**
 * Option
 *
 * Options are key/value pairs, e.g. -n myName. They can be in any order.
 *
 * @param {String} name The name of the option
 * @param {String} description Description of the option, used in help text and error messages.
 * @param {String} [short] Short version of Option, usually a "-" and a single character.
 * @param {String} [long] Long version of the Option, a "--" and multiple characters.
 * @param {String} [type]
 * @param {Number|String} [numValues] Number of values, how many values should follow the option. Can be 1 (default), any
 * integer, * (multiple), or + (at least 1)
 * @constructor
 */
function Option(options) {
    var defaults = {
        name: null,
        description: null,
        shortFlag: null,
        longFlag: null,
        type: 'string',
        length: '*'
    };
    this.options = helpers.merge(defaults, options);

	AbstractParameter.call(this, options.name, options.description);
}
util.inherits(Option, AbstractParameter);

/**
 * Validate Type
 *
 * Very simple validation for if something is a number or a string.
 * @param {*} value
 * @returns {boolean}
 */
Option.prototype.validateType = function(value) {
	switch(this.type) {
		case 'number':
		case 'double':
		case 'float':
			var numberRegex = new RegExp(/[-+]?[0-9]*([\.,][0-9]+)?/);
			return numberRegex.test(value);
			break;
		case 'string':
			//Anything is a string
		default:
			return true;
			break;
	}
};

/**
 * @param {Array} args
 * @param {Option[]} options
 * @type {Function}
 */
Option.parse = function (args, options) {
    var params = {};
    options.forEach(function (option) {
        debug('Testing option: ' + option.options.shortFlag, args);
        var optionIndex = args.indexOf(option.options.shortFlag);
        var optionLongIndex = args.indexOf(option.options.longFlag);
        if (optionIndex !== -1 || optionLongIndex !== -1) {
            var index = (optionIndex !== -1) ? optionIndex : optionLongIndex,
                value;
            switch (option.options.length) {
                case 1:
                case true:
                    //Just one
                    debug("\t-Single mode");
                    value = args[index + 1];
                    if (!option.validateType(value.toString())) {
                        throw new InvalidInputError("Option " + option.options.name + " had an invalid type: " + value + " wasn't of type " + option.options.type);
                    }
                    params[option.options.name] = value;
                    args.splice(index, 2);
                    break;
                case "+":
                    //At least one
                    debug("\t-At least one mode");
                    params[option.options.name] = [];
                    args.splice(index, 1);
                    while (true) {
                        if (args[index] && args[index][0] != '-') {
                            value = args.splice(index, 1)[0];
                            if (!option.validateType(value.toString())) {
                                throw new InvalidInputError("Option " + option.options.name + " had an invalid type: " + value + " wasn't of type " + option.options.type);
                            }
                            debug("\t\t-Adding: " + value);
                            params[option.options.name].push(value);
                        }
                        else {
                            break;
                        }
                    }
                    if (params[option.options.name].length === 0) {
                        throw new Error("Option " + option.options.name + " ")
                    }
                    break;
                case 0:
                case "*":
                    //Multiple
                    debug("\t-Multiple mode " + option.options.length);
                    params[option.options.name] = [];
                    args.splice(index, 1);
                    while (true) {
                        debug("\t\t-Testing: " + args[index]);
                        if (args[index] && args[index][0] != '-') {
                            value = args.splice(index, 1)[0];
                            if (!option.validateType(value.toString())) {
                                throw new InvalidInputError("Option " + option.options.name + " had an invalid type: " + value + " wasn't of type " + option.options.type);
                            }
                            debug("\t\t\t-Adding: " + value);
                            params[option.options.name].push(value);
                        }
                        else {
                            break;
                        }
                    }
                    break;
                default:
                    //A fixed number
                    debug("\t-Fixed mode");
                    params[option.options.name] = [];
                    args.shift();
                    for (var i = 1; i <= option.options.length; i++) {
                        if (args[0][0] != '-') {
                            value = args.shift();
                            if (!option.validateType(value.toString())) {
                                throw new InvalidInputError("Option " + option.options.name + " had an invalid type: " + value + " wasn't of type " + option.options.type);
                            }
                            params[option.options.name].push(value);
                        }
                        else {
                            throw new InvalidInputError('Option ' + option.options.name + ' requires ' + option.options.length + ' but stopped at ' + args[index + i]);
                        }
                    }
            }
            if (params[option.options.name] instanceof Array && params[option.options.name].length === 0) {
                params[option.options.name] = null;
            }
        }
        else if (option.options.length > 0) {
            debug("Option " + option.options.shortFlag + "/" + option.options.longFlag + " not found");
            throw new InvalidInputError(option.options.shortFlag + "/" + option.options.longFlag + " is required, and wasn't found");
        }
    }.bind(this));
    debug('Args after option: ' + JSON.stringify(args) + "\n");
    return params;
};

module.exports = Option;