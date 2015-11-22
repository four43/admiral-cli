#!/usr/bin/node
var helpers = require('./helpers'),
    util = require('util');

/**
 * Command
 *
 * A command is a string, usually one of multiple, used for routing. Much like an API endpoint.
 * Commands are grouped, so you can validate against multiple sets.
 *
 * Options:
 *
 *  * name The name of the command
 *  * [description] Description of the command, used in help text and error messages.
 *  * [callback] function(cliInstance, command), A function that is called when this command is used.
 *
 * @param {{name, [description], [callback]}} options
 * @constructor
 */
function Command(options) {
    this.name = options.name;
    this.description = options.description;
    this.callback = options.callback;
}

module.exports = Command;