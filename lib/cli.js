#!/usr/bin/node
var Option = require('./option'),
	Flag = require('./flag'),
	CliError = require('./error'),
	debug = require('debug')('cli');

function Cli(appDescription) {

	this.params = {};
	this.options = [];
	this.flags = [];
	this.commandGroups = [];
}

Cli.prototype.addCommandGroup = function (name, description, commands, callback, required) {
	//Commands are Command objects
	//Commands are arrays
	//Commands are null
	return this;
}

Cli.prototype.option = function (name, description, short, long, type, required) {
	this.options.push(new Option(name, description, short, long, type, required));
	return this;
}

Cli.prototype.flag = function (name, description, short, long) {
	this.flags.push(new Flag(name, description, short, long));
	return this;
}

/**
 * Parse
 *
 *
 * @param args
 * @returns {boolean}
 * @throws {CliError}
 */
Cli.prototype.parse = function (args) {
	this.params = {};
	if (args == undefined) {
		args = process.argv;
	}
	console.log(args);
	//Parse Option
	this.options.forEach(function (option) {
		debug('Testing option: ' + option.short, args);
		var optionIndex = args.indexOf(option.short);
		var optionLongIndex = args.indexOf(option.long);
		if (optionIndex !== -1 || optionLongIndex !== -1) {
			var index = (optionIndex !== -1) ? optionIndex : optionLongIndex;
			this.params[option.name] = args[index + 1];
			args = args.slice(0, index).concat(args.slice(index + 2));
		}
		else if (option.required) {
			debug('Option ' + option.short + '/' + option.long + ' not found');
			throw new CliError(option.short + "/" + option.long + " is required, and wasn't found");
		}
	}.bind(this));

	//Parse flags
	for (var i = 1; i < args.length; i++) {
		var arg = args[i];
		if (arg.match(/^\-\-/)) {
			debug("Flag(s) (Long version) found: " + arg);
			var flag = this._findFlag(arg);
			if (flag) {
				this.params[flag.name] = true;
				args = args.slice(0, i).concat(args.slice(i + 1));
				i--;
				console.log(args);
			}
			else {
				throw new CliError("Flag '" + arg + "' is unknown");
			}
		}
		else if (arg[0] == "-") {
			debug("Flag(s) found: " + arg);
			arg = arg.substr(1);
			for (var j = 0; j < arg.length; j++) {
				var flag = this._findFlag('-' + arg[j]);
				if (flag) {
					this.params[flag.name] = true;
				}
				else {
					throw new CliError("Flag '" + arg + "' is unknown");
				}
			}
			args = args.slice(0, i).concat(args.slice(i + 1));
			i--;
			console.log(args);
		}
	}
	//Set all other registered flags to false
	this.flags.forEach(function (flag) {
		if (!this.params.hasOwnProperty(flag.name)) {
			this.params[flag.name] = false;
		}
	}.bind(this));


	//Parse Commands Groups (order of these matter)

	return true;
}

Cli.prototype.getHelpText = function () {

}

Cli.prototype._findFlag = function (key) {
	debug('_findFlag: ' + key);
	for (var i = 0; i < this.flags.length; i++) {
		var flag = this.flags[i];
		if (flag.short == key || flag.long == key) {
			debug('Flag found!', flag);
			return flag;
		}
	}
	debug('returning null');
	return null;
}

module.exports = Cli;