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

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Symbol = require('babel-runtime/core-js/symbol')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
    value: true
});

exports.expect = expect;

var _zanaUtil = require('zana-util');

var _zanaUtil2 = _interopRequireDefault(_zanaUtil);

var _zanaCheck = require('zana-check');

var _zanaCheck2 = _interopRequireDefault(_zanaCheck);

var log = console.log.bind(console);

var toString = Object.prototype.toString;
var regexType = /\s([a-zA-Z]+)/;
var typename = function typename(item) {
    if (item.prototype) item = item.prototype;
    return toString.call(item).match(regexType)[1];
};

var ASSERT_TYPE = _Symbol('assert_type');

function inspect(x) {
    var type = _zanaUtil2['default'].getType(x);
    switch (type) {
        case _zanaUtil2['default'].types.number:
            if (isNaN(x)) return 'NaN';
            break;
    }
    return toString.call(x);
    // return x.toString();
    // return JSON.stringify(x); // for now
}

var AssertionError = (function (_Error) {

    // silly way of properly extending an error

    function AssertionError(message) {
        _classCallCheck(this, AssertionError);

        _get(Object.getPrototypeOf(AssertionError.prototype), 'constructor', this).call(this);
        Error.captureStackTrace(this, this.constructor);
        _Object$defineProperty(this, 'message', {
            value: message
        });
    }

    _inherits(AssertionError, _Error);

    _createClass(AssertionError, [{
        key: 'name',
        get: function () {
            return this.constructor.name;
        }
    }]);

    return AssertionError;
})(Error);

exports.AssertionError = AssertionError;

var Assertion = (function () {
    function Assertion(_ref) {
        var given = _ref.given;
        var _ref$test = _ref.test;
        var test = _ref$test === undefined ? function () {} : _ref$test;
        var _ref$expected = _ref.expected;
        var expected = _ref$expected === undefined ? null : _ref$expected;
        var _ref$flipped = _ref.flipped;
        var flipped = _ref$flipped === undefined ? false : _ref$flipped;
        var _ref$message = _ref.message;
        var message = _ref$message === undefined ? null : _ref$message;

        _classCallCheck(this, Assertion);

        this.message = message; // override if necessary
        this.given = given;
        this.message = 'Expected ' + inspect(this.given);

        // try {
        //     if (given instanceof Function) {
        //         this.fn = given;
        //         this.given = given();
        //     }
        //     else {
        //         this.given = given;
        //     }
        //     if (!this.message)
        //         this.message = `Expected ${inspect(this.given)}`;
        // }
        // catch(e) {
        //     this.error = e;
        //     // let functionString = given.toString();
        //     // let functionBody = functionString.substring(functionString.indexOf("{") + 1, functionString.lastIndexOf("}")).trim();
        //     // this.message = `Expected ${functionBody}`;
        //     this.message = `Expected function`;
        // }
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
        value: function (type) {
            var name = _zanaCheck2['default'].isString(type) ? type : typename(type);
            this.message += ' ' + name + '!';
            this.test = function (x, y) {
                return _zanaCheck2['default'].is(x, y);
            };
            this.expected = type;
            this.assert();
        }
    }, {
        key: 'true',
        value: function _true() {
            this.message += ' truthy!';
            this.test = function (x) {
                return x ? true : false;
            };
            // this.expected = true;
            this.assert();
        }
    }, {
        key: 'false',
        value: function _false() {
            this.message += ' falsy!';
            this.test = function (x) {
                return x ? false : true;
            };
            // this.expected = false;
            this.assert();
        }
    }, {
        key: 'empty',
        value: function empty() {
            this.message += ' empty!';
            this.test = function (x) {
                return _zanaCheck2['default'].empty(x);
            };
            this.expected = true;
            this.assert();
        }
    }, {
        key: 'exist',
        value: function exist() {
            this.message += ' exist!';
            this.test = function (x) {
                return _zanaCheck2['default'].exists(x);
            };
            this.expected = true;
            this.assert();
        }
    }, {
        key: 'throw',
        value: function _throw() {
            var _this = this;

            var type = arguments[0] === undefined ? null : arguments[0];

            var name = null;
            if (type) {
                if (_zanaCheck2['default'].isString(type)) {
                    name = type; // assume it's already the right name
                } else {
                    if (type.name) {
                        // error which has a name
                        name = type.name;
                    } else {
                        // what to do with this one?
                        log('in here');
                        name = _zanaUtil2['default'].getType(type);
                    }
                }
            } else name = 'an error';
            this.message += ' throw ' + name + '!';

            this.test = function () {
                try {
                    _this.given();
                } catch (e) {
                    _this.error = e;
                }
                if (!_this.error) // no error was thrown
                    return false;
                if (!type) // don't care what type of error we caught, just that we caught one
                    return true;
                if (type.prototype && _zanaCheck2['default'].is(type, _this.error)) return true;
                if (_zanaCheck2['default'].isString(type)) {
                    if (_this.error.name && _this.error.name.toLowerCase() === name.toLowerCase()) return true;
                }
                return false;
            };
            this.expected = true;
            this.assert();
        }
    }, {
        key: 'equal',
        value: function equal(target) {
            this.message += ' equal ' + inspect(target) + '!';
            this.expected = target;
            this.test = function (x, y) {
                return _zanaUtil2['default'].equals(x, y);
            };
            this.assert();
        }
    }, {
        key: 'assert',
        value: function assert() {
            var result = this.test(this.given, this.expected);
            if (this.flipped) result = !result;
            if (!result) {
                if (this.message) throw new AssertionError(this.message); // + ` Received ${result}`);
                else {
                    var functionString = this.test.toString();
                    var functionBody = functionString.substring(functionString.indexOf('{') + 1, functionString.lastIndexOf('}')).trim();
                    throw new AssertionError('Assertion failed: ' + functionBody);
                }
            }
        }
    }, {
        key: 'not',
        get: function () {
            this.message += ' not';
            this.flipped = !this.flipped;
            return this;
        }
    }, {
        key: 'is',
        get: function () {
            this.message += ' is';
            return this;
        }
    }, {
        key: 'to',
        get: function () {
            this.message += ' to';
            return this;
        }
    }, {
        key: 'be',
        get: function () {
            this.message += ' be';
            return this;
        }
    }, {
        key: 'of',
        get: function () {
            this.message += ' of';
            return this;
        }
    }]);

    return Assertion;
})();

exports.Assertion = Assertion;

var Assert = (function () {
    function Assert() {
        _classCallCheck(this, Assert);
    }

    _createClass(Assert, [{
        key: 'true',
        value: function _true(value) {
            return this.expect(value).to.be['true']();
        }
    }, {
        key: 'false',
        value: function _false(value) {
            return this.expect(value).to.be['false']();
        }
    }, {
        key: 'equal',
        value: function equal(val1, val2) {
            return this.expect(val1).to.equal(val2);
        }
    }, {
        key: 'expect',
        value: function expect(value) {
            return new Assertion({
                given: value
            });
        }
    }, {
        key: 'empty',

        /**
            Asserts that the provided value is empty.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function empty(value) {
            return this.expect(value).to.be.empty();
            // this.true(() => check.empty(value));
        }
    }, {
        key: 'nonEmpty',

        /**
            Asserts that the provided value is not empty.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function nonEmpty(value) {
            this['false'](function () {
                return _zanaCheck2['default'].empty(value);
            });
        }
    }, {
        key: 'exists',

        /**
            Asserts that the provided value is not equal to null or undefined.
              @param {any} value The value to check for null or undefined values.
            @throws {error} An error is thrown if the value is equal to null or undefined.
        */
        value: function exists(value) {
            this.expect(value).to.exist();
        }
    }, {
        key: 'is',

        /**
            Asserts that the provided values are of the same type.
              @param {any} val1 The first value for type comparison.
            @param {any} val2 The second value for type comparison.
            @throws {error} An error is thrown if the types of the values are not equal.
        */
        value: function is(val1, val2) {
            this.expect(val1).to.be.type(val2);
        }
    }, {
        key: 'isArray',

        /**
            Asserts that the provided value is an array type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isArray(value) {
            this.expect(value).to.be.an(Array);
        }
    }, {
        key: 'isBoolean',

        /**
            Asserts that the provided value is a boolean type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isBoolean(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isBoolean(value);
            });
        }
    }, {
        key: 'isDate',

        /**
            Asserts that the provided value is a date type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isDate(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isDate(value);
            });
        }
    }, {
        key: 'isFunction',

        /**
            Asserts that the provided value is a function type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isFunction(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isFunction(value);
            });
        }
    }, {
        key: 'isIterable',
        value: function isIterable(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isIterable(value);
            });
        }
    }, {
        key: 'isNumber',

        /**
            Asserts that the provided value is a number type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isNumber(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isNumber(value);
            });
        }
    }, {
        key: 'isObject',

        /**
            Asserts that the provided value is an object type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isObject(value) {
            this.expect(value).to.be.type(Object);
        }
    }, {
        key: 'isString',

        /**
            Asserts that the provided value is a string type.
              @param {any} value The value on which to check the assertion.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isString(value) {
            this['true'](function () {
                return _zanaCheck2['default'].isString(value);
            });
        }
    }, {
        key: 'isValue',

        /**
            Asserts that the provided value is a value (non-reference) type.
              @param {any} value The value on which to check the assertion.
            @returns {boolean} True, if the assertion passes.
            @throws {error} An error is thrown if the assertion fails.
        */
        value: function isValue(value) {
            // useful? consider deprecating.
            this['true'](function () {
                return _zanaCheck2['default'].isValue(value);
            });
        }
    }, {
        key: 'throws',
        value: function throws(fn) {
            var errType = arguments[1] === undefined ? null : arguments[1];

            return this.expect(fn).to['throw'](errType);
        }
    }]);

    return Assert;
})();

exports.Assert = Assert;

Assert.prototype.a = Assert.prototype.type;
Assert.prototype.an = Assert.prototype.type;
Assert.prototype.be = Assert.prototype.equal;

function expect(value) {
    return new Assertion({
        given: value
    });
}

var assert = new Assert();
exports['default'] = assert;