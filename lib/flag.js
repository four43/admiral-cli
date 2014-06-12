#!/usr/bin/node
var AbstractParameter = require('./abstract-parameter');

function Flag(name, description, short, long) {
	AbstractParameter.call(this, name, description);

	this.short = short;
	this.long = long;
}
Flag.prototype = Object.create(AbstractParameter.prototype);

module.exports = Flag;