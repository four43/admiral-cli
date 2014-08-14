#!/usr/bin/node

/**
 * Abstract Output Parser
 *
 * An output parser generates help test.
 * @param cli {Cli}
 * @constructor
 */
function AbstractOutputParser(cli) {
	this.cli = cli;
}
AbstractOutputParser.prototype = {};

AbstractOutputParser.prototype.output = function() {

}
module.exports = AbstractOutputParser;