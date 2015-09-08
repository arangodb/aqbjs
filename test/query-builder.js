/*jshint node: true, loopfunc: true, evil: true, -W014: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../types'),
  AqlError = require('../errors').AqlError,
  QB = require('../');

function each(examples, fn) {
  for (var i = 0; i < examples.length; i++) {
    fn(examples[i]);
  }
}

describe('QB', function () {
  it('null -> NullLiteral', function () {
    var result = QB(null);
    expect(result).to.be.a(types.NullLiteral);
  });
  it('undefined -> NullLiteral', function () {
    var result = QB(undefined);
    expect(result).to.be.a(types.NullLiteral);
  });
  it('int -> IntegerLiteral', function () {
    each([0, 1, 3, 23], function (value) {
      var result = QB(value);
      expect(result).to.be.an(types.IntegerLiteral);
      expect(result._value).to.equal(Number(value));
    });
  });
  it('int-like string -> StringLiteral', function () {
    each(['23', '+23', '-23'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('float -> NumberLiteral', function () {
    each([1.1, 3.14], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.NumberLiteral);
      expect(result).not.to.be.an(types.IntegerLiteral);
      expect(result._value).to.equal(Number(value));
    });
  });
  it('float-like string -> StringLiteral', function () {
    each(['1.1', '+1.1', '-1.1'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('boolean -> BooleanLiteral', function () {
    each([true, false], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.BooleanLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('quoted string -> StringLiteral', function () {
    each(['"lol"', '""', '"     "'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('range string -> StringLiteral', function () {
    each(['0..1', '2..3', '1000..5'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('identifier string -> StringLiteral', function () {
    each(['hi', 'o_hi_there', 'oHiMark'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('simple reference string -> StringLiteral', function () {
    each(['hi.mark', 'o.hi.there', 'oHi.Mark'], function (value) {
      var result = QB(value);
      expect(result).to.be.a(types.StringLiteral);
      expect(result._value).to.equal(value);
    });
  });
  it('Array -> ListLiteral', function () {
    var result = QB([123, 'hello']);
    expect(result).to.be.a(types.ListLiteral);
    expect(result._value[0]).to.be.an(types.IntegerLiteral);
    expect(result._value[0]._value).to.equal(123);
    expect(result._value[1]).to.be.a(types.StringLiteral);
    expect(result._value[1]._value).to.equal('hello');
  });
  it('Object -> ObjectLiteral', function () {
    var result = QB({x: 123, y: 'hello'});
    expect(result).to.be.a(types.ObjectLiteral);
    expect(result._value['"x"']).to.be.an(types.IntegerLiteral);
    expect(result._value['"x"']._value).to.equal(123);
    expect(result._value['"y"']).to.be.a(types.StringLiteral);
    expect(result._value['"y"']._value).to.equal('hello');
  });
  it('NaN throws an error', function () {
    expect(function () {
      QB(0 / 0);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
  it('Infinity throws an error', function () {
    expect(function () {
      QB(Infinity);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
  it('Negative Infinity throws an error', function () {
    expect(function () {
      QB(-Infinity);
    }).throwException(function (e) {
      expect(e).to.be.an(AqlError);
    });
  });
});