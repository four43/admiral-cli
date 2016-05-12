#!/usr/bin/node
var AbstractOutputParser = require('./abstract-output-parser');
var columnify = require('columnify');

function Tty(cli) {
	AbstractOutputParser.call(this, cli);
}

Tty.prototype = Object.create(AbstractOutputParser.prototype);

Tty.prototype.output = function () {
	this.usageStatement();
	this.commands();
	this.flags();
	this.options();
	process.stdout.write("\n");
};

Tty.prototype.usageStatement = function () {
	process.stdout.write("Usage: " + this.cli.scriptName);
	//Commands
	if (this.cli.elements.commandGroups.length !== 0) {
		this.cli.elements.commandGroups.forEach(function (commandGroup) {
			process.stdout.write(" [" + commandGroup.name + "]");
		});
	}

	//Flags
	if (this.cli.elements.flags.length !== 0) {
		process.stdout.write(" [flags]");
	}

	//Options
	if (this.cli.elements.options.length !== 0) {
		process.stdout.write(" [options]");
	}

	process.stdout.write("\n\n");
};

Tty.prototype.commands = function() {
	if (this.cli.elements.commandGroups.length !== 0) {
		var commandGroupOptions = [];
		process.stdout.write("Commands:\n");
		this.cli.elements.commandGroups.forEach(function(commandGroup) {
			commandGroupOptions.push(["\t", commandGroup.name, "-", commandGroup.description]);
			commandGroup.commands.forEach(function(command) {
				commandGroupOptions.push(["\t", "\t", command.name, command.description]);
			});
			commandGroupOptions.push([" "]);
		});
		commandGroupOptions.pop();

		var columns = columnify(commandGroupOptions, { showHeaders: false });
		process.stdout.write(columns);
		process.stdout.write("\n");
	}
};

Tty.prototype.flags = function () {
	if (this.cli.elements.flags.length !== 0) {
		var flagOptions = [];
		process.stdout.write("Flags:\n");
		this.cli.elements.flags.forEach(function (flag) {
			if(flag.shortFlag != null) {
				if(flag.longFlag != null) {
					flagOptions.push(["\t", flag.shortFlag + ", " + flag.longFlag, " ", flag.description]);
				}
				else {
					flagOptions.push(["\t", flag.shortFlag, " ", flag.description]);
				}
			}
			else {
				flagOptions.push(["\t", flag.longFlag, " ", flag.description]);
			}
		});
		var columns = columnify(flagOptions, { showHeaders: false });
		process.stdout.write(columns);
		process.stdout.write("\n");
	}
};

Tty.prototype.options = function () {
	if (this.cli.elements.options.length !== 0) {
		var optionDetails = [];
		process.stdout.write("Options:\n");
		this.cli.elements.options.forEach(function (option) {
			if(option.shortFlag != null) {
				if(option.longFlag != null) {
					optionDetails.push(["\t", option.shortFlag + ", " + option.longFlag, " ", option.description]);
				}
				else {
					optionDetails.push(["\t", option.shortFlag, " ", option.description]);
				}
			}
			else {
				optionDetails.push(["\t", option.longFlag, " ", option.description]);
			}
		});
		var columns = columnify(optionDetails, { showHeaders: false });
		process.stdout.write(columns);
		process.stdout.write("\n");
	}
};

module.exports = Tty;