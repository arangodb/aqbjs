/* jshint globalstrict: true, es3: true, loopfunc: true, evil: true, -W014: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../types'),
  AqlError = require('../errors').AqlError,
  autoCastToken = types.autoCastToken;

function each(examples, fn) {
  for (var i = 0; i < examples.length; i++) {
    fn(examples[i]);
  }
}

describe('autoCastToken', function () {
  it('null -> NullLiteral', function () {
    var result = autoCastToken(null);
    expect(result).to.be.a(types.NullLiteral);
  });
  it('undefined -> NullLiteral', function () {
    var result = autoCastToken(undefined);
    expect(result).to.be.a(types.NullLiteral);
  });
  it('int -> IntegerLiteral', function () {
    each([0, 1, 3, 23, '23', '+23', '-23'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.an(types.IntegerLiteral);
      expect(result.value).to.equal(Number(value));
    });
  });
  it('float -> NumberLiteral', function () {
    each([1.1, 3.14, '1.1', '+1.1', '-1.1'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.a(types.NumberLiteral);
      expect(result).not.to.be.an(types.IntegerLiteral);
      expect(result.value).to.equal(Number(value));
    });
  });
  it('boolean -> BooleanLiteral', function () {
    each([true, false], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.a(types.BooleanLiteral);
      expect(result.value).to.equal(value);
    });
  });
  it('quoted string -> StringLiteral', function () {
    each(['"lol"', '""', '"     "'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result.value).to.equal(value.slice(1, -1));
    });
  });
  it('range string -> RangeExpression', function () {
    each(['0..1', '2..3', '1000..5'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.a(types.RangeExpression);
      var val = value.split('..');
      expect(result.start.value).to.equal(Number(val[0]));
      expect(result.end.value).to.equal(Number(val[1]));
    });
  });
  it('identifier string -> Identifier', function () {
    each(['hi', 'o_hi_there', 'oHiMark'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.an(types.Identifier);
      expect(result.value).to.equal(value);
    });
  });
  it('simple reference string -> SimpleReference', function () {
    each(['hi.mark', 'o.hi.there', 'oHi.Mark'], function (value) {
      var result = autoCastToken(value);
      expect(result).to.be.a(types.SimpleReference);
      expect(result.value).to.equal(value);
    });
  });
  it('ArangoCollection -> Identifier', function () {
    function ArangoCollection(name) {
      this.name = function () {return name;};
    }
    each(['hi', 'o_hi_there', 'oHiMark'], function (value) {
      var result = autoCastToken(new ArangoCollection(value));
      expect(result).to.be.an(types.Identifier);
      expect(result.value).to.equal(value);
    });
  });
  it('Array -> ListLiteral', function () {
    var result = autoCastToken([123]);
    expect(result).to.be.a(types.ListLiteral);
    expect(result.value[0].value).to.equal(123);
  });
  it('Object -> ObjectLiteral', function () {
    var result = autoCastToken({x: 123});
    expect(result).to.be.a(types.ObjectLiteral);
    expect(result.value.x.value).to.equal(123);
  });
  it('NaN throws an error', function () {
    expect(function () {
      autoCastToken(0 / 0);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
  it('Infinity throws an error', function () {
    expect(function () {
      autoCastToken(Infinity);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
  it('Negative Infinity throws an error', function () {
    expect(function () {
      autoCastToken(-Infinity);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
})