var debug = require('debug')('EnvVar'),
	helpers = require('./Helpers'),

	InvalidInputError = require('./error/invalid-input');

function EnvVar(options) {
	if (options === undefined) {
		options = {};
	}
	this.name = options.name;
	this.description = options.description;
	this.type = options.type || 'string';
	this.required = (options.required !== undefined) ? options.required : true;

	if (this.name == null) {
		throw new InvalidInputError("Every EnvVar must have a name that corresponds to the variable name.");
	}
}

/**
 * Checks passed vars against the EnvVar collection of objects
 * @param {{}} vars
 * @param {EnvVar[]} EnvVar
 */
EnvVar.parse = function(vars, EnvVar) {
	var parsed = {},
		varKeys = Object.keys(vars);
	EnvVar.map(function(envVar) {
		debug('Testing EnvVar: ' + envVar.name, vars);
		if(vars[envVar.name]) {
			parsed[envVar.name] = helpers.validateType(envVar.type, vars[envVar.name]);
		}
		else if(envVar.required) {
			//Not found and required
			throw new InvalidInputError('The Environment Variable ' + envVar.name + ' must be set.');
		}
	});
	return parsed;
};

module.exports = EnvVar;