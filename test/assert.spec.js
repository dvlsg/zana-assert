const assert = require('../');
const { expect, AssertionError, Assert } = assert;
const util = require('zana-util');
const check = require('zana-check');
let log = console.log.bind(console);

describe('Assert', () => {

    describe('empty()', () => {

        it('should pass for undefined', () => {
            assert.empty(undefined);
        });

        it('should pass for null', () => {
            assert.empty(null);
        });

        it('should pass for empty strings', () => {
            assert.empty('');
        });

        it('should pass for zero and NaN', () => {
            assert.empty(+0);
            assert.empty(-0);
            assert.empty(NaN);
        });

        it('should pass for empty objects', () => {
            assert.empty({});
            let o1 = {a: 1};
            delete o1.a;
            assert.empty(o1);
        });

        it('should pass for empty arrays', () => {
            assert.empty([]);
            let a1 = [];
            a1.push(1);
            a1.pop();
            assert.empty(a1);
        });

        it('should pass for empty sets', () => {
            assert.empty(new Set());
            assert.empty(new Set([]));
            let s1 = new Set([1]);
            s1.delete(1);
            assert.empty(s1);
        });

        it('should pass for empty maps', () => {
            assert.empty(new Map());
            assert.empty(new Map([]));
            let m1 = new Map([['a', 1]]);
            m1.delete('a');
            assert.empty(m1);
        });

        it('should pass for any item with a length of 0', () => {
            class A {
                constructor(...args) {
                    this.arr = args;
                }
                get length() {
                    return this.arr.length;
                }
            };
            assert.empty(new A());
            let a1 = new A(1, 2);
            a1.arr.pop();
            a1.arr.pop();
            assert.empty(a1);
        });

        it('should fail for non empty strings', () => {
            assert.throws(() => { assert.empty('a'); });
            assert.throws(() => { assert.empty(' '); });
        });

        it('should fail for non empty numbers', () => {
            assert.throws(() => { assert.empty(1); });
            assert.throws(() => { assert.empty(0.001); });
            assert.throws(() => { assert.empty(Infinity); });
            assert.throws(() => { assert.empty(-Infinity); });
        });

        it('should fail for non empty objects', () => {
            assert.throws(() => { assert.empty({a: 1}); });
        });

        it('should fail for non empty arrays', () => {
            assert.throws(() => { assert.empty([1, 2, 3]); });
            assert.throws(() => { assert.empty([0]); });
            assert.throws(() => { assert.empty([undefined]); });
            assert.throws(() => { assert.empty([null]); });
        });

        it('should fail for non empty sets', () => {
            assert.throws(() => { assert.empty(new Set([1])); });
            let s1 = new Set();
            s1.add(undefined);
            assert.throws(() => { assert.empty(s1); });
            let s2 = new Set();
            s2.add(null);
            assert.throws(() => { assert.empty(s2); });
        });

        it('should fail for non empty maps', () => {
            assert.throws(() => { assert.empty(new Map([['a', 1]])); });
            let m1 = new Map();
            m1.set(undefined, undefined);
            assert.throws(() => { assert.empty(m1); });
            let m2 = new Map();
            m2.set(null, null);
            assert.throws(() => { assert.empty(m2); });
        });

        it('should fail for any item with a length greater than 0', () => {
            class A {
                constructor(...args) {
                    this.arr = args;
                }
                get length() {
                    return this.arr.length;
                }
            };
            assert.throws(() => { assert.empty(new A(1)); });
            assert.throws(() => { assert.empty(new A(null)); });
            assert.throws(() => { assert.empty(new A(undefined)); });
        });
        
    });

    describe('equal()', () => {

        it('should pass with both undefined', () => {
            assert.equal(undefined, undefined);
            assert.equal();
        });

        it('should pass with both null', () => {
            assert.equal(null, null);
        });

        it('should pass with equal booleans', () => {
            assert.equal(true, true);
            assert.equal(false, false);
        });

        it('should pass with equal strings', () => {
            assert.equal('', '');
            assert.equal(' ', ' ');
            assert.equal('0', '0');
            assert.equal('string', 'string');
        });

        it('should pass with equal numbers', () => {
            assert.equal(0, 0);
            assert.equal(1, 1);
            assert.equal(1.109258, 1.109258);
            assert.equal(Number.MAX_SAFE_INTEGER, 9007199254740991);
        });

        it('should pass with both NaN', () => {
            assert.equal(NaN, NaN);
            assert.equal(NaN, 0/0);
            assert.equal(NaN, "string"/0);
        });

        it('should pass with equal Infinity', () => {
            assert.equal(Infinity, Infinity);
            assert.equal(Number.POSITIVE_INFINITY, Infinity);
            assert.equal(Number.NEGATIVE_INFINITY, -Infinity);
        });

        it('should pass with both +/- 0', () => {
            assert.equal(+0, +0);
            assert.equal(+0, 0);
            assert.equal(+0, -0);
            assert.equal(-0, +0);
            assert.equal(-0, 0);
            assert.equal(-0, -0);
        });

        it('should pass with equal arrays', () => {
            assert.equal([], []);
            assert.equal([1], [1]);
            assert.equal(["1"], ["1"]);
        });

        it('should pass with equal objects', () => {
            assert.equal({}, {});
            assert.equal({a: 1}, {a: 1});
            assert.equal({a: 1, b: 2}, {b: 2, a: 1});
            assert.equal({a: 1, data: { arr: [1, 2, 3]}}, {a: 1, data: { arr: [1, 2, 3]}});
            
            let oa1 = {a: 1};
            let ob1 = {b: 2};
            let oa2 = {a: 1};
            let ob2 = {b: 2};
            oa1.b = ob1;
            ob1.a = oa1;
            oa2.b = ob2;
            ob2.a = oa2;
            assert.equal(oa1, oa2);
            assert.equal(ob1, ob2);

            let oc1 = {a: 1};
            oc1.c = oc1;
            let oc2 = {a: 1};
            oc2.c = oc2;
            assert.equal(oc1, oc2);
        });

        it('should pass with equal dates', () => {
            let d1 = new Date();
            let d2 = new Date(d1);
            assert.equal(d1, d2);

            let d3 = new Date('2015-01-01T00:00:00.000');
            let d4 = new Date('2015-01-01T00:00:00.000');
            assert.equal(d3, d4);
        });

        it('should pass with equal regular expressions', () => {
            assert.equal(/.*/, /.*/);
            assert.equal(/.*/g, /.*/g);
            assert.equal(/.*/ig, new RegExp('.*', 'gi'));
        });

        it('should pass with equal sets', () => {
            assert.equal(new Set(), new Set());
            assert.equal(new Set(), new Set([]));
            let s1 = new Set([1, 2, 3]);
            let s2 = new Set();
            s2.add(1);
            s2.add(2);
            s2.add(3);
            assert.equal(s1, s2);

            let oa = {a: 1};
            let ob = {b: 2};
            let oc = {c: 3};
            let od = {d: 4};
            let s3 = new Set([oa, ob, oc]);
            let s4 = new Set([util.clone(oa), util.clone(ob), util.clone(oc)]);
            assert.equal(s3, s4);
        });

        it('should pass with equal maps', () => {
            let m1 = new Map();
            let m2 = new Map();
            assert.equal(m1, m2);

            let m3 = new Map([['a', 1], ['b', 2], ['c', 3]]);
            let m4 = new Map([['b', 2], ['c', 3], ['a', 1]]); // order shouldn't matter
            assert.equal(m3, m4);

            let oa1 = {a: 1};
            let ob1 = {b: 2};
            let oc1 = {c: 3};
            let oa2 = {a: 1};
            let ob2 = {b: 2};
            let oc2 = {c: 3};
            let m5 = new Map([['a', oa1], ['b', ob1], ['c', oc1]]);
            let m6 = new Map([['a', oa2], ['b', ob2], ['c', oc2]]);
            assert.equal(m5, m6);
        });

        it('should pass with equal classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
                get [Symbol.toStringTag]() {
                    return 'A';
                }
            };

            class B extends A {
                get [Symbol.toStringTag]() {
                    return 'B';
                }
            };

            let a1 = new A(1, 2, 3);
            let a2 = new A(1, 2, 3);
            let a3 = new A();
            a3.a = 1;
            a3.b = 2;
            a3.c = 3;
            assert.equal(a1, a2);
            assert.equal(a1.constructor, a2.constructor);
            assert.equal(a1, a3);
            assert.equal(a1.constructor, a3.constructor);

            let b1 = new B(1, 2, 3);
            let b2 = new B();
            b2.a = 1;
            b2.b = 2;
            b2.c = 3;
            assert.equal(b1, b2);
            assert.equal(b1.constructor, b2.constructor);
        });

        it('should pass with equal symbols', () => {
            let s1 = Symbol();
            let s2 = s1;
            assert.equal(s1, s2);
            let s3 = Symbol.for('s');
            let s4 = Symbol.for('s');
            assert.equal(s3, s4);
        });

        it('should fail with non equal types', () => {
            class A {};
            class B {};
            assert.throws(() => { assert.equal(A, B); });
            assert.throws(() => { assert.equal(0, '0'); });
            assert.throws(() => { assert.equal(0, false); });
            assert.throws(() => { assert.equal(0, null); });
            assert.throws(() => { assert.equal(0, undefined); });
            assert.throws(() => { assert.equal(null, undefined); });
            assert.throws(() => { assert.equal({}, new A()); });
            assert.throws(() => { assert.equal(A, ()=>{}); });
            assert.throws(() => { assert.equal('null', null); });
            assert.throws(() => { assert.equal(undefined, 'undefined'); });
        });

        it('should fail with non equal booleans', () => {
            assert.throws(() => { assert.equal(true, false); });
            assert.throws(() => { assert.equal(false, true); });
        });

        it('should fail with non equal strings', () => {
            assert.throws(() => { assert.equal('', ' '); });
            assert.throws(() => { assert.equal(' ', ''); });
            assert.throws(() => { assert.equal(' ', '  '); });
            assert.throws(() => { assert.equal('\n', '\r\n'); });
            assert.throws(() => { assert.equal('a', 'A'); });
            assert.throws(() => { assert.equal('false', 'FALSE'); });
            assert.throws(() => { assert.equal('null', 'Null'); });
        });

        it('should fail with non equal numbers', () => {
            assert.throws(() => { assert.equal(0, 1); });
            assert.throws(() => { assert.equal(0, 0.1); });
            assert.throws(() => { assert.equal(Infinity, -Infinity); });
            assert.throws(() => { assert.equal(-Infinity, Infinity); });
        });

        it('should fail with non equal arrays', () => {
            assert.throws(() => { assert.equal([], [undefined]); });
            assert.throws(() => { assert.equal([], [null]); });
            assert.throws(() => { assert.equal([undefined], [null]); });
            assert.throws(() => { assert.equal([0], [1]); });
            assert.throws(() => { assert.equal([0], ['0']); });
            assert.throws(() => { assert.equal(
                  [{a: 1}, {b: 2}]
                , [{a: 1}, {c: 3}]
            ); });
        });

        it('should fail with non equal objects', () => {
            assert.throws(() => { assert.equal({}, {a: 1}); });
            assert.throws(() => { assert.equal({a: 1}, {a: 2}); });
            assert.throws(() => { assert.equal({a: 1}, {b: 1}); });
            assert.throws(() => { assert.equal({a: null}, {a: undefined}); });
        });

        it('should fail with non equal dates', () => {
            let d1 = new Date();
            let d2 = new Date(d1);
            d2.setTime(d2.getTime() + 1);
            assert.throws(() => { assert.equal(d1, d2); });
            assert.throws(() => { assert.equal(new Date(1000000), new Date(1000001)); });
            assert.throws(() => { assert.equal(new Date('2015-01-01T00:00:00.000', new Date('2015-01-01T00:00:00.001'))); });
            assert.throws(() => { assert.equal(new Date('2015-01-01T00:00:00.000', new Date('2015-01-01T00:00:00.000Z'))); });
        });

        it('should fail with non equal regular expressions', () => {
            assert.throws(() => { assert.equal(/.*/, /[.]*/); });
            assert.throws(() => { assert.equal(/.*/, /(.*)/); });
            assert.throws(() => { assert.equal(/.*/, /.*/g); });
            assert.throws(() => { assert.equal(/.*/i, /.*/g); });
        });

        it('should fail with non equal sets', () => {
            assert.throws(() => { assert.equal(new Set(), new Set([undefined])); });
            assert.throws(() => { assert.equal(
                  new Set([1, 2, 3])
                , new Set([1, 2, 4])
            ); });
        });

        it('should fail with non equal maps', () => {
            assert.throws(() => { assert.equal(new Map([[undefined, undefined]]), new Map()); });
            assert.throws(() => { assert.equal(
                  new Map([['a', 1], ['b', 2], ['c', 3]])
                , new Map([['a', 1], ['b', 4], ['c', 3]])
            ); });
        });

        it('should fail with non equal classes', () => {
            class A {
                constructor(a, b, c) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                }
            };
            let a0 = new A();
            let a1 = new A(1);
            let a2 = new A(1, 2);
            let a3 = new A(1, 2, 3);
            assert.throws(() => { assert.equal(a0, a1); });
            assert.throws(() => { assert.equal(a0, a2); });
            assert.throws(() => { assert.equal(a0, a3); });
            assert.throws(() => { assert.equal(a1, a2); });
            assert.throws(() => { assert.equal(a1, a3); });
            assert.throws(() => { assert.equal(a2, a3); });
        });

        it('should pass with non equal symbols', () => {
            let s1 = Symbol();
            let s2 = Symbol();
            assert.throws(() => { assert.equal(s1, s2); });

            let s3 = Symbol('s');
            let s4 = Symbol('s');
            assert.throws(() => { assert.equal(s3, s4); });

            let s5 = Symbol.for('s');
            let s6 = Symbol('s');
            assert.throws(() => { assert.equal(s5, s6); });
        });

    });

    describe('exists()', () => {

        it('should pass for any string', () => {
            assert.exists('string');
            assert.exists('');
            assert.exists('false');
            assert.exists('0');
        });

        it('should pass for any number', () => {
            assert.exists(0);
            assert.exists(+0);
            assert.exists(-0);
            assert.exists(Infinity);
            assert.exists(-Infinity);
            assert.exists(NaN);
        });

        it('should pass for any object', () => {
            assert.exists({a: 1});
            assert.exists({});
            assert.exists({valueOf: null});
        });

        it('should pass for any array', () => {
            assert.exists([]);
            assert.exists([false]);
            assert.exists([0]);
            assert.exists([undefined]);
            assert.exists([null]);
        });

        it('should pass for any set', () => {
            assert.exists(new Set());
            assert.exists(new Set([]));
            assert.exists(new Set([false]));
            assert.exists(new Set([0]));
            assert.exists(new Set([undefined]));
            assert.exists(new Set([null]));
        });

        it('should pass for any map', () => {
            assert.exists(new Map());
            assert.exists(new Map([[]]));
            assert.exists(new Map([[false, false]]));
            assert.exists(new Map([[undefined, undefined]]));
            assert.exists(new Map([[null, null]]));
            assert.exists(new Map([[0, 0]]));
        });

        it('should pass for any date', () => {
            assert.exists(new Date());
        });

        it('should pass for any regular expression', () => {
            assert.exists(/./);
            assert.exists(new RegExp());
        });

        it('should fail for undefined', () => {
            assert.throws(() => { assert.exists(null); });
        });

        it('should fail for null', () => {
            assert.throws(() => { assert.exists(undefined); });
        });

    });

    describe('false()', () => {

        it('should pass for boolean false', () => {
            assert.false(false);
        });

        it('should pass for zero numbers', () => {
            assert.false(0);
            assert.false(+0);
            assert.false(-0);
        });

        it('should pass for empty strings', () => {
            assert.false('');
        });

        it('should pass for NaN', () => {
            assert.false(NaN);
        });

        it('should pass for null', () => {
            assert.false(null);
        });

        it('should pass for undefined', () => {
            assert.false(undefined);
        });

        it('should fail for boolean true', () => {
            assert.throws(() => { assert.false(true); });
        });

        it('should fail for non zero numbers', () => {
            assert.throws(() => { assert.false(1); });
            assert.throws(() => { assert.false(-1); });
            assert.throws(() => { assert.false(Infinity); });
            assert.throws(() => { assert.false(-Infinity); });
        });

        it('should fail for non empty strings', () => {
            assert.throws(() => { assert.false(' '); });
            assert.throws(() => { assert.false('0'); });
            assert.throws(() => { assert.false('false'); });
            assert.throws(() => { assert.false('null'); });
            assert.throws(() => { assert.false('undefined'); });
        });

        it('should fail for arrays', () => {
            assert.throws(() => { assert.false([]); });
        });

        it('should fail for objects', () => {
            assert.throws(() => { assert.false({}); });
        });

        it('should fail for sets', () => {
            assert.throws(() => { assert.false(new Set()); });
        });

        it('should fail for maps', () => {
            assert.throws(() => { assert.false(new Map()); });
        });

        it('should fail for errors', () => {
            assert.throws(() => { assert.false(new Error()); });
        });

        it('should fail for regex', () => {
            assert.throws(() => { assert.false(new RegExp()); });
        });

        it('should fail for functions', () => {
            assert.throws(() => { assert.false(() => {}); });
        });

    });

    describe('instance()', () => {
        it('should pass for booleans from constructor', () => {
            assert.instance(new Boolean(), Boolean);
        });

        it('should fail for literal booleans', () => {
            assert.throws(() => { assert.instance(true, Boolean); });
            assert.throws(() => { assert.instance(false, Boolean); });
        });

        it('should pass for classes', () => {
            class A {};
            class B extends A {};
            assert.instance(new A(), A);
            assert.instance(new B(), B);
            assert.instance(new B(), A);
        });

        it('should pass for dates', () => {
            assert.instance(new Date(), Date);
        });

        it('should pass for maps', () => {
            assert.instance(new Map(), Map);
        });

        it('should pass for numbers from constructor', () => {
            assert.instance(new Number(1), Number);
            assert.instance(new Number(), Number);
        });

        it('should fail for literal numbers', () => {
            assert.throws(() => { assert.instance(0, Number); });
            assert.throws(() => { assert.instance(-0, Number); });
            assert.throws(() => { assert.instance(-0, Number); });
            assert.throws(() => { assert.instance(NaN, Number); });
            assert.throws(() => { assert.instance(Infinity, Number); });
            assert.throws(() => { assert.instance(-Infinity, Number); });
        });

        it('should pass for objects', () => {
            assert.instance({}, Object);
        });

        it('should pass for regular expressions', () => {
            assert.instance(/.*/, RegExp);
        });

        it('should pass for sets', () => {
            assert.instance(new Set(), Set);
        });

        it('should pass for strings from constructor', () => {
            assert.instance(new String('stuff'), String);
            assert.instance(new String(), String);
        });

        it('should fail for literal strings', () => {
            assert.throws(() => { assert.instance('string', String); });
        });
    });

    describe('is()', () => {

        it('should pass for two strings', () => {
            assert.is('', '');
            assert.is('', 'string');
            assert.is('', new String());
            assert.is('', String());
            assert.is('', String);
        });

        it('should pass for two numbers', () => {
            assert.is(0, 0);
            assert.is(0, NaN);
            assert.is(0, new Number());
            assert.is(0, Number());
            assert.is(0, Number);
        });
        
        it('should pass for two objects', () => {
            assert.is({}, {});
            assert.is({}, new Object());
            assert.is({}, Object());
            assert.is({}, Object);
        });
        
        it('should pass for two arrays', () => {
            assert.is([], []);
            assert.is([], new Array());
            assert.is([], Array());
            assert.is([], Array);
        });

        it('should pass for two sets', () => {
            assert.is(new Set(), new Set());
            assert.is(new Set(), Set);
        });
        
        it('should pass for two maps', () => {
            assert.is(new Map(), new Map());
            assert.is(new Map(), Map);
        });
        
        it('should pass for two dates', () => {
            assert.is(new Date(), new Date());
            // note that `Date()` without `new` actually returns a string
            assert.is(Date(), String);
            assert.is(new Date(), Date);
        });
        
        it('should pass for two regular expressions', () => {
            assert.is(/.*/, /.*/);
            assert.is(/.*/, new RegExp());
            assert.is(/.*/, RegExp());
            assert.is(/.*/, RegExp);
        });

        it('should pass for errors', () => {
            assert.is(new Error(), new Error());
            assert.is(new Error(), Error());
            assert.is(new Error(), Error);
        });
        
        it('should pass for two of the same class', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.is(new A(), new A());
            assert.is(new A(), A);
        });

        it('should fail for a string and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is('', 0); });
            assert.throws(() => { assert.is('', []); });
            assert.throws(() => { assert.is('', {}); });
            assert.throws(() => { assert.is('', new Set()); });
            assert.throws(() => { assert.is('', new Map()); });
            assert.throws(() => { assert.is('', new RegExp()); });
            assert.throws(() => { assert.is('', new Date()); });
            assert.throws(() => { assert.is('', new Error()); });
            assert.throws(() => { assert.is('', new A()); });
            assert.throws(() => { assert.is('', Symbol()); });
        });

        it('should fail for a number and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(0, ''); });
            assert.throws(() => { assert.is(0, []); });
            assert.throws(() => { assert.is(0, {}); });
            assert.throws(() => { assert.is(0, new Set()); });
            assert.throws(() => { assert.is(0, new Map()); });
            assert.throws(() => { assert.is(0, new RegExp()); });
            assert.throws(() => { assert.is(0, new Date()); });
            assert.throws(() => { assert.is(0, new Error()); });
            assert.throws(() => { assert.is(0, new A()); });
            assert.throws(() => { assert.is(0, Symbol()); });
        });

        it('should fail for an array and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is([], 0); });
            assert.throws(() => { assert.is([], ''); });
            assert.throws(() => { assert.is([], {}); });
            assert.throws(() => { assert.is([], new Set()); });
            assert.throws(() => { assert.is([], new Map()); });
            assert.throws(() => { assert.is([], new RegExp()); });
            assert.throws(() => { assert.is([], new Date()); });
            assert.throws(() => { assert.is([], new Error()); });
            assert.throws(() => { assert.is([], new A()); });
            assert.throws(() => { assert.is([], Symbol()); });
        });

        it('should fail for an object and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is({}, 0); });
            assert.throws(() => { assert.is({}, ''); });
            assert.throws(() => { assert.is({}, []); });
            assert.throws(() => { assert.is({}, new Set()); });
            assert.throws(() => { assert.is({}, new Map()); });
            assert.throws(() => { assert.is({}, new RegExp()); });
            assert.throws(() => { assert.is({}, new Date()); });
            assert.throws(() => { assert.is({}, new Error()); });
            assert.throws(() => { assert.is({}, new A()); });
            assert.throws(() => { assert.is({}, Symbol()); });
        });

        it('should fail for a set and any other type', () => {
            class A {};
            assert.throws(() => { assert.is(new Set(), 0); });
            assert.throws(() => { assert.is(new Set(), ''); });
            assert.throws(() => { assert.is(new Set(), []); });
            assert.throws(() => { assert.is(new Set(), {}); });
            assert.throws(() => { assert.is(new Set(), new Map()); });
            assert.throws(() => { assert.is(new Set(), new RegExp()); });
            assert.throws(() => { assert.is(new Set(), new Date()); });
            assert.throws(() => { assert.is(new Set(), new Error()); });
            assert.throws(() => { assert.is(new Set(), new A()); });
            assert.throws(() => { assert.is(new Set(), Symbol()); });
        });

        it('should fail for a map and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(new Map(), 0); });
            assert.throws(() => { assert.is(new Map(), ''); });
            assert.throws(() => { assert.is(new Map(), []); });
            assert.throws(() => { assert.is(new Map(), {}); });
            assert.throws(() => { assert.is(new Map(), new Set()); });
            assert.throws(() => { assert.is(new Map(), new RegExp()); });
            assert.throws(() => { assert.is(new Map(), new Date()); });
            assert.throws(() => { assert.is(new Map(), new Error()); });
            assert.throws(() => { assert.is(new Map(), new A()); });
            assert.throws(() => { assert.is(new Map(), Symbol()); });
        });

        it('should fail for a regexp and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(/.*/, 0); });
            assert.throws(() => { assert.is(/.*/, ''); });
            assert.throws(() => { assert.is(/.*/, []); });
            assert.throws(() => { assert.is(/.*/, {}); });
            assert.throws(() => { assert.is(/.*/, new Set()); });
            assert.throws(() => { assert.is(/.*/, new Map()); });
            assert.throws(() => { assert.is(/.*/, new Date()); });
            assert.throws(() => { assert.is(/.*/, new Error()); });
            assert.throws(() => { assert.is(/.*/, new A()); });
            assert.throws(() => { assert.is(/.*/, Symbol()); });
        });

        it('should fail for a date and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(new Date(), 0); });
            assert.throws(() => { assert.is(new Date(), ''); });
            assert.throws(() => { assert.is(new Date(), []); });
            assert.throws(() => { assert.is(new Date(), {}); });
            assert.throws(() => { assert.is(new Date(), new Set()); });
            assert.throws(() => { assert.is(new Date(), new Map()); });
            assert.throws(() => { assert.is(new Date(), new RegExp()); });
            assert.throws(() => { assert.is(new Date(), new Error()); });
            assert.throws(() => { assert.is(new Date(), new A()); });
            assert.throws(() => { assert.is(new Date(), Symbol()); });
        });

        it('should fail for an error and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(new Error(), 0); });
            assert.throws(() => { assert.is(new Error(), ''); });
            assert.throws(() => { assert.is(new Error(), []); });
            assert.throws(() => { assert.is(new Error(), {}); });
            assert.throws(() => { assert.is(new Error(), new Set()); });
            assert.throws(() => { assert.is(new Error(), new Map()); });
            assert.throws(() => { assert.is(new Error(), new RegExp()); });
            assert.throws(() => { assert.is(new Error(), new Date()); });
            assert.throws(() => { assert.is(new Error(), new A()); });
            assert.throws(() => { assert.is(new Error(), Symbol()); });
        });

        it('should fail for classes and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(new A(), 0); });
            assert.throws(() => { assert.is(new A(), ''); });
            assert.throws(() => { assert.is(new A(), []); });
            assert.throws(() => { assert.is(new A(), {}); });
            assert.throws(() => { assert.is(new A(), new Set()); });
            assert.throws(() => { assert.is(new A(), new Map()); });
            assert.throws(() => { assert.is(new A(), new RegExp()); });
            assert.throws(() => { assert.is(new A(), new Date()); });
            assert.throws(() => { assert.is(new A(), new Error()); });
            assert.throws(() => { assert.is(new A(), Symbol()); });
        });

        it('should fail for symbols and any other type', () => {
            class A { get [Symbol.toStringTag]() { return 'A'; }};
            assert.throws(() => { assert.is(Symbol(), 0); });
            assert.throws(() => { assert.is(Symbol(), ''); });
            assert.throws(() => { assert.is(Symbol(), []); });
            assert.throws(() => { assert.is(Symbol(), {}); });
            assert.throws(() => { assert.is(Symbol(), new Set()); });
            assert.throws(() => { assert.is(Symbol(), new Map()); });
            assert.throws(() => { assert.is(Symbol(), new RegExp()); });
            assert.throws(() => { assert.is(Symbol(), new Date()); });
            assert.throws(() => { assert.is(Symbol(), new Error()); });
            assert.throws(() => { assert.is(Symbol(), new A()); });
        });

    });

    describe('throws()', () => {

        it('should pass for thrown errors', () => {
            assert.throws(() => { throw new Error(); });
        });

        it('should pass for errors by instance of type', () => {
            assert.throws(() => { throw new Error(); }, Error);
            assert.throws(() => { assert.true(false); }, Error);
            assert.throws(() => { assert.true(false); }, AssertionError);
            assert.throws(() => { throw new Number(); }, Number); // hopefully no one ever attempts this, but it does work.
        });

        it('should pass for errors by string match on message', () => {
            assert.throws(() => { throw new Error('Unexpected error!'); }, 'Unexpected');
        });

        it('should pass for errors by regex match on message', () => {
            assert.throws(() => { throw new Error('Unexpected error!'); }, /Unexpected/);
        });

        it('should fail for no thrown error', () => {
            assert.throws(() => { assert.throws(() => {}); });
        });

        it('should fail for errors with wrong type', () => {
            assert.throws(() => { assert.throws(() => { throw new Error(); }, AssertionError); });
        });

        it('should fail for errors with message not containing string', () => {
            assert.throws(() => { assert.throws(() => { throw new Error('Unexpected error!'); }, 'missing'); });
        });

        it('should fail for errors with message not matching regex', () => {
            assert.throws(() => { assert.throws(() => { throw new Error('Unexpected error!'); }, /\d/g); });
        });

    });

    describe('true()', () => {

        it('should pass for boolean true', () => {
            assert.true(true);
        });

        it('should pass for non-zero numbers', () => {
            assert.true(1);
            assert.true(-1);
            assert.true(0.0001);
        });

        it('should pass for non-empty strings', () => {
            assert.true('string!');
            assert.true(' ');
        });

        it('should pass for arrays', () => {
            assert.true([1,2,3]);
            assert.true([]);
        });

        it('should pass for objects', () => {
            assert.true({a: 1});
            assert.true({});
        });

        it('should pass for functions', () => {
            assert.true(() => {});
        });

        it('should pass for dates', () => {
            assert.true(new Date());
        });

        it('should pass for regex', () => {
            assert.true(/.*/);
        });

    });

});
