/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  FunctionCall = types.FunctionCall,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('FunctionCall', function () {
  it('returns an expression', function () {
    var expr = new FunctionCall('hello');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('wraps well-formed strings as function names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__',
      'all_lower_case::__cRaZy__',
      'snakeCaseAlso::__cRaZy__',
      'CamelCaseHere::__cRaZy__',
      'ALL_UPPER_CASE::__cRaZy__',
      '__cRaZy__::__cRaZy__',
      '__cRaZy__::__cRaZy__::__cRaZy__::__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new FunctionCall(values[i]).toAQL()).to.equal(values[i] + '()');
    }
  });
  it('does not accept malformed strings as function names', function () {
    var values = [
      '',
      '-x',
      'in-valid',
      'also bad',
      'überbad',
      'spaß',
      'not:good:either'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new FunctionCall(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as function names', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new FunctionCall(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('auto-casts arguments', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new FunctionCall('hello', arr);
    for (var i = 0; i < arr.length; i++) {
      expect(expr.args[i].constructor).to.equal(ctors[i]);
    }
  });
  it('does not accept truthy non-array argument arrays', function () {
    var values = [
      (function () {return arguments;}()),
      {0: 'a', 1: 'b', 2: 'c'},
      new types.StringLiteral('abc'),
      42,
      'hello',
      /absurd/,
      function () {},
      {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new FunctionCall('hello', values[i]);}).to.throwException(isAqlError);
    }
  });
});