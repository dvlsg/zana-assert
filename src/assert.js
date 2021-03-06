/*
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

const { getType, types, equals } = require('zana-util');
const check = require('zana-check');
const { inspect } = require('util');

let toString = Object.prototype.toString;
let regexType = /\s([a-zA-Z]+)/;
let typename = (item) => {
    if (item && item.prototype)
        item = item.prototype;
    return toString.call(item).match(regexType)[1];
};

let ASSERT_TYPE = Symbol('assert_type');

class AssertionError extends Error {

    // silly way of properly extending an error
    // (note: this actually works in Node v6, we could simplify quite a bit)
    constructor({message, actual = null, expected = null}) {
        super();
        if (Error.captureStackTrace && check.instance(Error.captureStackTrace, Function))
            Error.captureStackTrace(this, this.constructor);
        else {
            let stack = (new Error()).stack;
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

    get name() {
        return this.constructor.name;
    }

    get [Symbol.toStringTag]() {
        return 'AssertionError';
    }
}

class Assertion {

    constructor({
          given
        , test     = () => {}
        , expected = null
        , flipped  = false
        , message  = null
    }) {
        this.message = message; // override if necessary? considering dropping
        this.actual = given;
        if (!this.message)
            this.message = `Expected ${inspect(this.actual)}`;
        this.test = test;
        this.expected = expected;
        this.flipped = flipped;
    }

    get not() {
        this.message += ' not';
        this.flipped = !this.flipped;
        return this;
    }

    get is() {
        this.message += ' is';
        return this;
    }

    get to() {
        this.message += ' to';
        return this;
    }

    get be() {
        this.message += ' be';
        return this;
    }

    get of() {
        this.message += ' of';
        return this;
    }

    a(type) {
        this.message += ' a';
        this[ASSERT_TYPE](type);
    }

    an(type) {
        this.message += ' an';
        this[ASSERT_TYPE](type);
    }

    type(type) {
        this.message += ' type';
        this[ASSERT_TYPE](type);
    }

    [ASSERT_TYPE](type) {
        let name = check.isString(type) ? type : typename(type);
        this.message += ` ${name}!`;
        this.expected = type;
        let passed = check.is(this.actual, this.expected) ^ this.flipped;
        if (!passed) {
            throw new AssertionError({
                  message  : this.message
                , actual   : inspect(this.actual)
                , expected : name // tbd if this is right
            });
        }
    }

    instance(type) {
        this.message += ` instance of ${typename(type)}!`;
        this.expected = type;
        if (!check.instance(this.actual, this.expected) ^ this.flipped) {
            throw new AssertionError({
                  message  : this.message
                , actual   : typename(this.actual)
                , expected : typename(this.expected)
            });
        }
    }

    true() {
        this.message += ' truthy!';
        let passed = !!this.actual;
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                message: this.message
            });
        }
    }

    false() {
        this.message += ' falsy!';
        let passed = !this.actual;
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                message: this.message
            });
        }
    }

    empty() {
        this.message += ' empty!';
        let passed = check.empty(this.actual);
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                message: this.message
            });
        }
    }

    exist() {
        this.message += ' exist!';
        let passed = check.exists(this.actual);
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                message: this.message
            });
        }
    }

    ['throw'](option = null) {
        let passed = false;
        let err = null;
        try {
            this.actual();
            this.actual = null;
        }
        catch(caught) {
            err = caught;
        }
        let type = getType(option);
        switch (type) {
            case types.undefined:
            case types.null:
                passed = !!err;
                this.message += ` throw an error!`;
                this.actual = inspect(err);
                this.expected = 'Error';
                break;
            case types.string:
                passed = err && err.message && err.message.indexOf(option) > -1;
                this.message += ` throw an error with a message containing ${inspect(option)}`;
                this.actual = err;
                this.expected = inspect(option);
                break;
            case types.regexp:
                passed = err && err.message && option.test(err.message);
                this.message += ` throw an error matching regex ${option}!`;
                this.actual = err;
                this.expected = option.toString();
                break;
            default:
                passed = check.instance(err, option);
                this.message += ` throw instance of ${typename(option)}`;
                this.actual = typename(err);
                this.expected = typename(option);
                break;
        }
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                  message  : this.message
                , actual   : this.actual
                , expected : this.expected
            });
        }
    }

    equal(target) {
        this.message += ` equal ${inspect(target)}!`;
        this.expected = target;
        let passed = equals(this.actual, this.expected);
        if (!(passed ^ this.flipped)) {
            throw new AssertionError({
                  message  : this.message
                , actual   : inspect(this.actual)
                , expected : inspect(this.expected)
            });
        }
    }
}

/**
    Returns a new assertion containing the given value.

    @param {any} val The value to attach to the assertion.
*/
function expect(val) {
    return new Assertion({
        given : val
    });
}

/**
    Asserts that the provided values is truthy.

    @param {any} val The value for falsy comparison.
    @throws {error} An error is thrown if the values are not equal.
*/
function truthy(val) {
    expect(val).to.be.true();
}

/**
    Asserts that the provided values is falsy.

    @param {any} val The value for falsy comparison.
    @throws {error} An error is thrown if the values was not falsy.
*/
function falsy(val) {
    expect(val).to.be.false();
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

function throws(fn, errType = null) {
    expect(fn).to.throw(errType);
}

module.exports = {
      Assertion
    , AssertionError
    , empty
    , equal
    , equals: equal
    , exists
    , expect
    , false: falsy
    , falsy
    , instance
    , is
    , nonEmpty
    , ok: truthy
    , throws
    , true: truthy
    , truthy
};
