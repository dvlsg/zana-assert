/*
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _Symbol$toStringTag = require('babel-runtime/core-js/symbol/to-string-tag')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.expect = expect;
exports.truthy = truthy;
exports.falsy = falsy;
exports.equal = equal;
exports.empty = empty;
exports.nonEmpty = nonEmpty;
exports.exists = exists;
exports.instance = instance;
exports.is = is;
exports.throws = throws;

var _zanaUtil = require('zana-util');

var _zanaUtil2 = _interopRequireDefault(_zanaUtil);

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

var toString = Object.prototype.toString;
var regexType = /\s([a-zA-Z]+)/;
var typename = function typename(item) {
    if (item && item.prototype) item = item.prototype;
    return toString.call(item).match(regexType)[1];
};

var ASSERT_TYPE = _Symbol('assert_type');

var AssertionError = (function (_Error) {

    // silly way of properly extending an error

    function AssertionError(_ref) {
        var message = _ref.message;
        var _ref$actual = _ref.actual;
        var actual = _ref$actual === undefined ? null : _ref$actual;
        var _ref$expected = _ref.expected;
        var expected = _ref$expected === undefined ? null : _ref$expected;

        _classCallCheck(this, AssertionError);

        _get(Object.getPrototypeOf(AssertionError.prototype), 'constructor', this).call(this);
        if (Error.captureStackTrace && _zanaCheck2['default'].is(Error.captureStackTrace, Function)) Error.captureStackTrace(this, this.constructor);else {
            var stack = new Error().stack;
            Object.defineProperty(this, 'stack', {
                value: stack
            });
        }
        Object.defineProperty(this, 'message', {
            value: message
        });
        if (actual) {
            Object.defineProperty(this, 'actual', {
                value: actual
            });
        }
        if (expected) {
            Object.defineProperty(this, 'expected', {
                value: expected
            });
        }
    }

    _inherits(AssertionError, _Error);

    _createClass(AssertionError, [{
        key: 'name',
        get: function get() {
            return this.constructor.name;
        }
    }, {
        key: _Symbol$toStringTag,
        get: function get() {
            return 'AssertionError';
        }
    }]);

    return AssertionError;
})(Error);

exports.AssertionError = AssertionError;

var Assertion = (function () {
    function Assertion(_ref2) {
        var given = _ref2.given;
        var _ref2$test = _ref2.test;
        var test = _ref2$test === undefined ? function () {} : _ref2$test;
        var _ref2$expected = _ref2.expected;
        var expected = _ref2$expected === undefined ? null : _ref2$expected;
        var _ref2$flipped = _ref2.flipped;
        var flipped = _ref2$flipped === undefined ? false : _ref2$flipped;
        var _ref2$message = _ref2.message;
        var message = _ref2$message === undefined ? null : _ref2$message;

        _classCallCheck(this, Assertion);

        this.message = message; // override if necessary? considering dropping
        this.actual = given;
        if (!this.message) this.message = 'Expected ' + _zanaUtil2['default'].inspect(this.actual);
        this.test = test;
        this.expected = expected;
        this.flipped = flipped;
    }

    _createClass(Assertion, [{
        key: 'a',
        value: function a(type) {
            this.message += ' a';
            this[ASSERT_TYPE](type);
        }
    }, {
        key: 'an',
        value: function an(type) {
            this.message += ' an';
            this[ASSERT_TYPE](type);
        }
    }, {
        key: 'type',
        value: function type(_type) {
            this.message += ' type';
            this[ASSERT_TYPE](_type);
        }
    }, {
        key: ASSERT_TYPE,
        value: function value(type) {
            var name = _zanaCheck2['default'].isString(type) ? type : typename(type);
            this.message += ' ' + name + '!';
            this.expected = type;
            var passed = _zanaCheck2['default'].is(this.actual, this.expected) ^ this.flipped;
            if (!passed) {
                throw new AssertionError({
                    message: this.message,
                    actual: _zanaUtil2['default'].inspect(this.actual),
                    expected: name // tbd if this is right
                });
            }
        }
    }, {
        key: 'instance',
        value: function instance(type) {
            this.message += ' instance of ' + typename(type) + '!';
            this.expected = type;
            if (!_zanaCheck2['default'].instance(this.actual, this.expected) ^ this.flipped) {
                throw new AssertionError({
                    message: this.message,
                    actual: typename(this.actual),
                    expected: typename(this.expected)
                });
            }
        }
    }, {
        key: 'true',
        value: function _true() {
            this.message += ' truthy!';
            var passed = !!this.actual;
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message
                });
            }
        }
    }, {
        key: 'false',
        value: function _false() {
            this.message += ' falsy!';
            var passed = !this.actual;
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message
                });
            }
        }
    }, {
        key: 'empty',
        value: function empty() {
            this.message += ' empty!';
            var passed = _zanaCheck2['default'].empty(this.actual);
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message
                });
            }
        }
    }, {
        key: 'exist',
        value: function exist() {
            this.message += ' exist!';
            var passed = _zanaCheck2['default'].exists(this.actual);
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message
                });
            }
        }
    }, {
        key: 'throw',
        value: function _throw() {
            var option = arguments[0] === undefined ? null : arguments[0];

            var passed = false;
            var err = null;
            try {
                this.actual();
                this.actual = null;
            } catch (caught) {
                err = caught;
            }
            var type = _zanaUtil2['default'].getType(option);
            switch (type) {
                case _zanaUtil2['default'].types.undefined:
                case _zanaUtil2['default'].types['null']:
                    passed = !!err;
                    this.message += ' throw an error!';
                    this.actual = _zanaUtil2['default'].inspect(err);
                    this.expected = 'Error';
                    break;
                case _zanaUtil2['default'].types.string:
                    passed = err && err.message && err.message.indexOf(option) > -1;
                    this.message += ' throw an error with a message containing ' + _zanaUtil2['default'].inspect(option);
                    this.actual = err;
                    this.expected = _zanaUtil2['default'].inspect(option);
                    break;
                case _zanaUtil2['default'].types.regexp:
                    passed = err && err.message && option.test(err.message);
                    this.message += ' throw an error matching regex ' + option + '!';
                    this.actual = err;
                    this.expected = option.toString();
                    break;
                default:
                    passed = _zanaCheck2['default'].instance(err, option);
                    this.message += ' throw instance of ' + typename(option);
                    this.actual = typename(err);
                    this.expected = typename(option);
                    break;
            }
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message,
                    actual: this.actual,
                    expected: this.expected
                });
            }
        }
    }, {
        key: 'equal',
        value: function equal(target) {
            this.message += ' equal ' + _zanaUtil2['default'].inspect(target) + '!';
            this.expected = target;
            var passed = _zanaUtil2['default'].equals(this.actual, this.expected);
            if (!(passed ^ this.flipped)) {
                throw new AssertionError({
                    message: this.message,
                    actual: _zanaUtil2['default'].inspect(this.actual),
                    expected: _zanaUtil2['default'].inspect(this.expected)
                });
            }
        }
    }, {
        key: 'not',
        get: function get() {
            this.message += ' not';
            this.flipped = !this.flipped;
            return this;
        }
    }, {
        key: 'is',
        get: function get() {
            this.message += ' is';
            return this;
        }
    }, {
        key: 'to',
        get: function get() {
            this.message += ' to';
            return this;
        }
    }, {
        key: 'be',
        get: function get() {
            this.message += ' be';
            return this;
        }
    }, {
        key: 'of',
        get: function get() {
            this.message += ' of';
            return this;
        }
    }]);

    return Assertion;
})();

exports.Assertion = Assertion;

/**
    Returns a new assertion containing the given value.

    @param {any} val The value to attach to the assertion.
*/

function expect(val) {
    return new Assertion({
        given: val
    });
}

/**
    Asserts that the provided values is truthy.

    @param {any} val The value for falsy comparison.
    @throws {error} An error is thrown if the values are not equal.
*/

function truthy(val) {
    expect(val).to.be['true']();
}

/**
    Asserts that the provided values is falsy.

    @param {any} val The value for falsy comparison.
    @throws {error} An error is thrown if the values was not falsy.
*/

function falsy(val) {
    expect(val).to.be['false']();
}

/**
    Asserts that the provided values are equal.

    @param {any} val1 The first value for equality comparison.
    @param {any} val2 The second value for equality comparison.
    @throws {error} An error is thrown if the values are not equal.
*/

function equal(val1, val2) {
    expect(val1).to.equal(val2);
}

/**
    Asserts that the provided value is empty.

    @param {any} value The value on which to check the assertion.
    @throws {error} An error is thrown if the assertion fails.
*/

function empty(value) {
    expect(value).to.be.empty();
}

/**
    Asserts that the provided value is not empty.

    @param {any} value The value on which to check the assertion.
    @throws {error} An error is thrown if the assertion fails.
*/

function nonEmpty(value) {
    expect(value).to.not.be.empty();
}

/**
    Asserts that the provided value is not equal to null or undefined.

    @param {any} value The value to check for null or undefined values.
    @throws {error} An error is thrown if the value is equal to null or undefined.
*/

function exists(value) {
    expect(value).to.exist();
}

/**
    Asserts that the first argument is an instance of the second argument.

    @param {any} arg1 The first value for instanceof assertion.
    @param {Function} arg2 The second value for instanceof assertion.
    @throws {error} An error is thrown if arg1 is not an instance of arg2.
*/

function instance(arg1, arg2) {
    expect(arg1).to.be.instance(arg2);
}

/**
    Asserts that the provided values are of the same type.

    @param {any} val1 The first value for type comparison.
    @param {any} val2 The second value for type comparison.
    @throws {error} An error is thrown if the types of the values are not equal.
*/

function is(val1, val2) {
    expect(val1).to.be.type(val2);
}

/**
    Asserts that the provided value is a value (non-reference) type.

    @param {any} value The value on which to check the assertion.
    @returns {boolean} True, if the assertion passes.
    @throws {error} An error is thrown if the assertion fails.
*/

function throws(fn) {
    var errType = arguments[1] === undefined ? null : arguments[1];

    expect(fn).to['throw'](errType);
}

exports['default'] = {
    empty: empty,
    equal: equal,
    'equals': equal,
    exists: exists,
    expect: expect,
    'false': falsy,
    falsy: falsy,
    instance: instance,
    is: is,
    nonEmpty: nonEmpty,
    'ok': truthy,
    throws: throws,
    'true': truthy,
    truthy: truthy
};