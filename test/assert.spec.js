import assert, {expect, AssertionError, Assert} from '../src/assert.js';
import util from 'zana-util';
import check from 'zana-check';
let log = console.log.bind(log);

describe('Assert', () => {

    describe('empty()', () => {

        it('should pass for numbers of zero', () => {
            assert.empty(0);
            assert.empty(+0);
            assert.empty(-0);
        });

        it('should pass for empty strings', () => {
            assert.empty('');
        });

        it('should pass for empty arrays', () => {
            assert.empty([]);
        });

        it('should pass for empty objects', () => {
            let obj = {};
            assert.empty(obj);
            obj.a = 1;
            delete obj.a;
            assert.empty(obj);
        });

        xit('should pass for empty sets', () => {
            assert.empty(new Set()); // requires a fix in zana-util, use Set.size
        });

        xit('should pass for empty maps', () => {
            assert.empty(new Map()); // also requires a fix in zana-util
        });
        
    });

    describe('equal()', () => {

        it('should pass for undefined', () => {
            let val;
            assert.equal(val, val);
            assert.equal(val, undefined);
            assert.equal(undefined, undefined);
        });

        it('should pass for null', () => {
            assert.equal(null, null);
        });

        xit('should pass for equal numbers', () => {
            assert.equal(0, 0);
            assert.equal(1, 1);
            // assert.equal(NaN, NaN); // needs a zana-util bug fix
        });

        it('should pass for equal strings', () => {
            assert.equal('string', 'string');
            assert.equal('', '');
            assert.equal(' ', ' ');
        });

        it('should pass for equal objects', () => {
            let obj = {};
            assert.equal(obj, obj);
            assert.equal(obj, {});
            assert.equal({}, {});
            assert.equal({a: 1}, {a: 1});
            assert.equal({a: [1, 2, 3]}, {a: [1, 2, 3]});
            assert.equal({a: 1, b: "2"}, {a: 1, b: "2"});
        });

        it('should pass with circular references', () => {
            let objA1 = {a: 1};
            let objB1 = {b: 2};
            let objA2 = {a: 1};
            let objB2 = {b: 2};
            objA1.b = objB1;
            objB1.a = objA1;
            objA2.b = objB2;
            objB2.a = objA2;
            assert.equal(objA1, objA2);

            let objC1 = {c: 3};
            let objC2 = {c: 3};
            objC1.c2 = objC2;
            objC1.c1 = objC1;
            objC2.c1 = objC1;
            objC2.c2 = objC2;
            assert.equal(objC1, objC2);
        });

        it('should pass with equal arrays', () => {
            assert.equal([], []);
            assert.equal([1], [1]);
            assert.equal([1, "2", 3], [1, "2", 3]);
            assert.equal([{a: 1}, {b: 2}], [{a: 1}, {b: 2}]);
        });

        it('should pass with equal regular expressions', () => {
            assert.equal(/(.*)/, /(.*)/);
            assert.equal(new RegExp('ABC', 'g'), new RegExp('ABC', 'g'));
            assert.equal(new RegExp('(\\d+)[.](\\d+)', 'g'), /(\d+)[.](\d+)/g);
        });

        it('should pass with equal dates', () => {
            let d1 = Date.parse('2015-01-01T00:00:00');
            let d2 = Date.parse('2015-01-01T00:00:00');
            assert.equal(d1, d2);
            assert.equal(new Date(), new Date()); // is this guaranteed? might not be.
        });

    });

    describe('exists()', () => {

        it('should pass for anything not null or undefined', () => {
            assert.exists(1);
            assert.exists(0);
            assert.exists(Infinity);
            assert.exists(-Infinity);
            assert.exists(NaN);
            assert.exists(' ');
            assert.exists('');
            assert.exists(new RegExp(''));
            assert.exists(new Date());
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

    });

    describe('is()', () => {

        it('should pass for native types', () => {
            assert.is('', String);
            assert.is(0, Number);
            assert.is(NaN, Number);
            assert.is(/.*/, RegExp);
            assert.is(new Set(), Set);
            assert.is(new Map(), Map);
            assert.is(new WeakSet(), WeakSet);
            assert.is(new WeakMap(), WeakMap);
            assert.is(new Date(), Date);
            assert.is(new Error(), Error);
            assert.is(null, null);
            assert.is(undefined, undefined);
        });

        it('should pass for custom types', () => {
            assert.is(assert, Assert);
            function C() {};
            let c = new C();
            assert.is(c, C);
        });

    });

    describe('throws()', () => {

        it('should pass for thrown errors', () => {
            assert.throws(() => { throw new Error; });
        });

        it('should pass for specific errors by type', () => {
            assert.throws(() => { throw new Error; }, Error);
            assert.throws(() => { assert.true(false); }, AssertionError);
        });

        it('should pass for specific errors by name', () => {
            assert.throws(() => { throw new Error; }, 'Error');
            assert.throws(() => { assert.true(false); }, 'AssertionError');
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
