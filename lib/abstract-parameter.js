#!/usr/bin/node

/**
 * Abstract Parameter
 *
 * Parameter is a general term for anything passed to the program. They share some things
 * in common, those will be here.
 * @param name {String}
 * @param description {String}
 * @constructor
 */
function AbstractParameter(name, description) {
    this.name = name;
    this.description = description;
}

module.exports = AbstractParameter;