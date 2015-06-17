/*
    @license
    Copyright (C) 2015 Dave Lesage
    License: MIT
    See license.txt for full license text.
*/
"use strict";

import util from 'zana-util';
import check from 'zana-check';

let log = console.log.bind(console);

let toString = Object.prototype.toString;
let regexType = /\s([a-zA-Z]+)/;
let typename = (item) => {
    if (item && item.prototype)
        item = item.prototype;
    return toString.call(item).match(regexType)[1];
};

let ASSERT_TYPE = Symbol('assert_type');

function inspect(x) {
    // to be expanded / improved in the future. possibly grab/use node's built in inspect from util.
    let type = util.getType(x);
    switch(type) {
        case util.types.number:
            if (isNaN(x))
                return 'NaN';
            break;
    }
    return toString.call(x);
    // return JSON.stringify(x); // for now
}

export class AssertionError extends Error {

    // silly way of properly extending an error
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        Object.defineProperty(this, 'message', {
            value: message
        });
    }

    get name() {
        return this.constructor.name;
    }
}

export class Assertion {

    given: any;
    expected: any;
    received: any;
    test: Function;
    flipped: boolean;
    message: string;

    constructor({
          given
        , test     = () => {}
        , expected = null
        , flipped  = false
        , message  = null
    }) {
        this.message = message; // override if necessary
        this.given = given;
        this.message = `Expected ${inspect(this.given)}`;

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

    a(type: any) {
        this.message += ' a';
        this[ASSERT_TYPE](type);
    }

    an(type: any) {
        this.message += ' an';
        this[ASSERT_TYPE](type);
    }

    type(type: any) {
        this.message += ' type';
        this[ASSERT_TYPE](type);
    }

    [ASSERT_TYPE](type: any) {
        let name = check.isString(type) ? type : typename(type);
        this.message += ` ${name}!`;
        this.test = (x, y) => check.is(x, y);
        this.expected = type;
        this.assert();
    }

    true() {
        this.message += ' truthy!';
        this.test = (x) => x ? true : false;
        // this.expected = true;
        this.assert();
    }

    false() {
        this.message += ' falsy!';
        this.test = (x) => x ? false : true;
        // this.expected = false;
        this.assert();
    }

    empty() {
        this.message += ' empty!';
        this.test = (x) => check.empty(x);
        this.expected = true;
        this.assert();
    }

    exist() {
        this.message += ' exist!';
        this.test = x => check.exists(x);
        this.expected = true;
        this.assert();
    }

    ['throw'](type = null) {
        let name = null;
        if (type) {
            if (check.isString(type)) {
                name = type; // assume it's already the right name
            }
            else {
                if (type.name) { // error which has a name
                    name = type.name;
                }
                else {// what to do with this one?
                    log('in here');
                    name = util.getType(type);
                }
            }
        }
        else
            name = 'an error';
        this.message += ` throw ${name}!`;

        this.test = () => {
            try {
                this.given();
            }
            catch(e) {
                this.error = e;
            }
            if (!this.error) // no error was thrown
                return false;
            if (!type) // don't care what type of error we caught, just that we caught one
                return true;
            if (type.prototype && check.is(type, this.error))
                return true;
            if (check.isString(type)) {
                if (this.error.name && this.error.name.toLowerCase() === name.toLowerCase())
                    return true;
            }
            return false;
        };
        this.expected = true;
        this.assert();
    }

    equal(target) {
        this.message += ` equal ${inspect(target)}!`;
        this.expected = target;
        this.test = (x, y) => util.equals(x, y);
        this.assert();
    }

    assert() {
        let result = this.test(this.given, this.expected);
        if (this.flipped)
            result = !result;
        if (!result) {
            if(this.message)
                throw new AssertionError(this.message); // + ` Received ${result}`);
            else {
                let functionString = this.test.toString();
                let functionBody = functionString.substring(functionString.indexOf("{") + 1, functionString.lastIndexOf("}")).trim();
                throw new AssertionError(`Assertion failed: ${functionBody}`);
            }
        }
    }
}

export class Assert {

    constructor() {}

    true(value) {
        return this.expect(value).to.be.true();
    }

    false(value) {
        return this.expect(value).to.be.false();
    }

    equal(val1, val2) {
        return this.expect(val1).to.equal(val2);
    }

    expect(value) {
        return new Assertion({
            given : value
        });
    }

    /**
        Asserts that the provided value is empty.

        @param {any} value The value on which to check the assertion.
        @throws {error} An error is thrown if the assertion fails.
    */
    empty(value) {
        return this.expect(value).to.be.empty();
        // this.true(() => check.empty(value));
    }

    /**
        Asserts that the provided value is not empty.

        @param {any} value The value on which to check the assertion.
        @throws {error} An error is thrown if the assertion fails.
    */
    nonEmpty(value) {
        this.false(() => check.empty(value));
    }

    /**
        Asserts that the provided value is not equal to null or undefined.

        @param {any} value The value to check for null or undefined values.
        @throws {error} An error is thrown if the value is equal to null or undefined.
    */
    exists(value) {
        this.expect(value).to.exist();
    }

    /**
        Asserts that the provided values are of the same type.

        @param {any} val1 The first value for type comparison.
        @param {any} val2 The second value for type comparison.
        @throws {error} An error is thrown if the types of the values are not equal.
    */
    is(val1, val2) {
        this.expect(val1).to.be.type(val2);
    }

    isIterable(value) {
        this.true(() => check.isIterable(value));
    }

    /**
        Asserts that the provided value is a value (non-reference) type.

        @param {any} value The value on which to check the assertion.
        @returns {boolean} True, if the assertion passes.
        @throws {error} An error is thrown if the assertion fails.
    */
    isValue(value) {
        // useful? consider deprecating.
        this.true(() => check.isValue(value));
    }

    throws(fn, errType = null) {
        return this.expect(fn).to.throw(errType);
    }
}

Assert.prototype.a = Assert.prototype.type;
Assert.prototype.an = Assert.prototype.type;
Assert.prototype.be = Assert.prototype.equal;

export function expect(value) {
    return new Assertion({
        given: value
    });
}

let assert = new Assert();
export default assert;
