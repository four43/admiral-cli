#!/usr/bin/node
var AbstractOutputParser = require('./abstract-output-parser');
var columnify = require('columnify');

var CommandGroup = require('./../CommandGroup'),
	Flag = require('./../Flag'),
	Option = require('./../Option');

function Tty(cli) {
	AbstractOutputParser.call(this, cli);
}

Tty.prototype = Object.create(AbstractOutputParser.prototype);

Tty.prototype.output = function () {
	process.stdout.write(usageStatement(this.cli.scriptName, this.cli.elements) + "\n");
	if(this.cli.elements.commandGroups.length) {
		process.stdout.write("Commands:\n");
		process.stdout.write(indent(displayElements(this.cli.elements.commandGroups)));
		process.stdout.write("\n");
	}
	if(this.cli.elements.options.length) {
		process.stdout.write("Options:\n");
		process.stdout.write(indent(displayElements(this.cli.elements.options)));
		process.stdout.write("\n");
	}
	if(this.cli.elements.flags.length) {
		process.stdout.write("Flags:\n");
		process.stdout.write(indent(displayElements(this.cli.elements.flags)));
	}
};

function displayElements(elements, subGroup) {
	var elementTextGroups = elements.map(function(element) {
		if(element instanceof Flag) {
			return getFlagContent(element);
		}
		if(element instanceof Option) {
			return getOptionContent(element);
		}
		if(element instanceof CommandGroup) {
			return getCommandGroupContent(element, subGroup);
		}
	});
	return elementTextGroups.join("\n") + "\n";
}

function usageStatement(scriptName, elements) {
	var output = "Usage: " + scriptName;
	//Commands
	if (elements.commandGroups.length !== 0) {
		elements.commandGroups.map(function (commandGroup) {
			output += " [" + commandGroup.name + "]";
		});
	}

	//Options
	if (elements.options.length !== 0) {
		output += " [options]";
	}

	//Flags
	if (elements.flags.length !== 0) {
		output += " [flags]";
	}

	return output;
}

function getCommandGroupContent(commandGroup, subCommand) {
	var commandGroupHeader = [];
	if(!subCommand) {
		commandGroupHeader = "[" + commandGroup.name + "] - " + commandGroup.description;
	}
	var commandCols = commandGroup.commands.map(function (command) {
		if(command.subElements.length) {
			var commandText = command.name;
			if(command.subElements.filter(function(element) { return (element instanceof CommandGroup);}).length) {
				commandText += " [command]";
			}
			if(command.subElements.filter(function(element) { return (element instanceof Option);}).length) {
				commandText += " [option]";
			}
			if(command.subElements.filter(function(element) { return (element instanceof Flag);}).length) {
				commandText += " [flag]";
			}
			commandText += " - " + command.description + "\n";
			commandText += indent(displayElements(command.subElements, true));
			return commandText;
		}
		else {
			return command.name + " - " + command.description;
		}
	});
	var commandText = commandCols.join("\n");

	if(!subCommand) {
		return commandGroupHeader + "\n" + indent(commandText);
	}
	return commandGroupHeader + commandText;
}

function getFlagContent(flag) {
	var output = [];
	if (flag.shortFlag != null) {
		if (flag.longFlag != null) {
			output = [flag.shortFlag + "," + flag.longFlag, "-", flag.description];
		}
		else {
			output = [flag.shortFlag, "-", flag.description];
		}
	}
	else {
		output = [flag.longFlag, "-", flag.description];
	}
	return output.join(" ");
}

function getOptionContent(option) {
	var output = [];
	if (option.shortFlag != null) {
		if (option.longFlag != null) {
			output = [option.shortFlag + "," + option.longFlag, "-", option.description];
		}
		else {
			output = [option.shortFlag, "-", option.description];
		}
	}
	else {
		output = [option.longFlag, "-", option.description];
	}
	return output.join(" ");
}

function indent(str) {
	return str
		.split("\n")
		.map(function(row) {
			if(row) {
				return "\t" + row;
			}
			else {
				return "";
			}
		})
		.join("\n");
}

module.exports = Tty;