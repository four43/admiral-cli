#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter');

/**
 * Command
 *
 * A command is a string, usually one of multiple, used for routing. Much like an API endpoint.
 * @param {String} name The name of the command
 * @param {String} description Description of the command, used in help text and error messages.
 * @param {Function} [callback] A function that is called when this command is used.
 * @constructor
 */
function Command(name, description, callback) {
    AbstractParameter.call(this, name, description);
}

module.exports = Command;