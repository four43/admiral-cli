var InvalidInputError = require('./error/invalid-input');
/**
 * Validate Type
 *
 * Very simple validation for if something is a number or a string.
 * @param {string} type
 * @param {*} value
 * @returns {Number|String}
 */
function validateType(type, value) {
	var numberRegex;
	switch (type.toLowerCase()) {
		case 'integer':
		case 'int':
			numberRegex = new RegExp('^[-+]?[0-9]+$');
			if (numberRegex.test(value)) {
				return parseInt(value);
			}
			else {
				throw new InvalidInputError(value + " wasn't of type " + type);
			}
			break;
		case 'number':
		case 'float':
		case 'double':
			numberRegex = new RegExp('^[-+]?[0-9]*([\.,][0-9]+)?$');
			if (numberRegex.test(value)) {
				return parseFloat(value);
			}
			else {
				throw new InvalidInputError(value + " wasn't of type " + type);
			}
			break;
		case 'string':
			//Anything is a string
			return value;
		default:
			return value;
			break;
	}
}

/**
 * Merge
 *
 * Just a simple little object merge. Overrides objectA with objectB
 *
 * @param {Object} objectA - Starting object
 * @param {Object} objectB - Object who's keys override objectA's
 * @returns {{}}
 */
function merge(objectA, objectB) {
	for (var attrName in objectB) {
		if (objectB.hasOwnProperty(attrName)) {
			if (objectA.hasOwnProperty(attrName) && objectA[attrName] instanceof Object && objectB.hasOwnProperty(attrName) && objectB[attrName] instanceof Object) {
				objectA[attrName] = merge(objectA[attrName], objectB[attrName]);
			}
			else {
				objectA[attrName] = objectB[attrName];
			}
		}
	}
	return objectA;
}

/**
 * Deep Copy
 *
 * Creates a new object, copying the variables one by one into it.
 * Available as a GitHub Gist: https://gist.github.com/four43/f93647e8feaa54713cfe
 * @param {Object|Array} input The input object or array to copy.
 * @param {Number} [maxDepth] The max depth the function should recurse before passing by reference, default: 5
 * @param {Number} [depth] Starts at 0, used by recursion
 * @returns {Object|Array}
 */
function deepCopy(input, maxDepth, depth) {
	if (maxDepth === undefined) {
		maxDepth = 5;
	}
	if (depth === undefined) {
		depth = 0;
	}

	if (depth > maxDepth) {
		return null;
	}

	// Handle the 3 simple types, and null or undefined
	if (input === null || input === undefined || typeof input !== "object") {
		return input;
	}

	// Date
	if (input instanceof Date) {
		var dateCopy = new Date();
		dateCopy.setTime(input.getTime());
		return dateCopy;
	}

	// Array
	if (input instanceof Array) {
		var arrayCopy = [];
		for (var i = 0, len = input.length; i < len; i++) {
			arrayCopy[i] = this.deepCopy(input[i], maxDepth, depth + 1);
		}
		return arrayCopy;
	}
	// Object
	if (input instanceof Object) {
		var newObj = {};
		for (var prop in input) {
			if (input.hasOwnProperty(prop)) newObj[prop] = this.deepCopy(input[prop]);
		}
		return newObj;
	}
}

module.exports = {
	validateType: validateType,
	deepCopy: deepCopy,
	merge: merge
};