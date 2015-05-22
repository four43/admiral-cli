var fs = require('fs'),
    helpers = require('./../lib/helpers'),
    Cli = require('./../lib/cli'),
    Command = require('./../lib/command');

exports.testMergeSimple = function (test) {
    var a = {
        hello: 'world'
    };
    var b = {
        foo: 'bar'
    };
    var expected = {
        hello: 'world',
        foo: 'bar'
    };
    var result = helpers.merge(a, b);
    test.deepEqual(result, expected);
    test.done();
};

exports.testMergeOverwrite = function (test) {
    var a = {
        hello: 'world'
    };
    var b = {
        hello: 'bar'
    };
    var expected = {
        hello: 'bar'
    };
    var result = helpers.merge(a, b);
    test.deepEqual(result, expected);
    test.done();
};

exports.testMergeDeepOverwrite = function (test) {
    var a = {
        option1: {
            subOpt1: 'hello'
        }
    };
    var b = {
        option1: 'bar'
    };
    var expected = {
        option1: 'bar'
    };
    var result = helpers.merge(a, b);
    test.deepEqual(result, expected);
    test.done();
};

exports.testMergeDeep = function (test) {
    var a = {
        option1: {
            subOpt1: 'hello'
        }
    };
    var b = {
        option1: {
            subOpt2: 'hi'
        }
    };
    var expected = {
        option1: {
            subOpt1: 'hello',
            subOpt2: 'hi'
        }
    };
    var result = helpers.merge(a, b);
    test.deepEqual(result, expected, 'testMergeDeep didn\'t work');
    test.done();
};

exports.testMergeSuperDeep = function (test) {
    var a = {
        a: {
            a1: 'hello',
            a2: true
        },
        b: {
            b1: {
                b1a: false,
                b1b: 'foo'
            }
        }
    };
    var b = {
        a: {
            a1: 'h1'
        },
        b: {
            b1: {
                b1a: true
            }
        },
        c: {
            c1: {
                c1a: 'bar'
            }
        }
    };
    var expected = {
        a: {
            a1: 'h1',
            a2: true
        },
        b: {
            b1: {
                b1a: true,
                b1b: 'foo'
            }
        },
        c: {
            c1: {
                c1a: 'bar'
            }
        }
    };
    var result = helpers.merge(a, b);
    test.deepEqual(result, expected, 'testMergeDeep didn\'t work');
    test.done();
};