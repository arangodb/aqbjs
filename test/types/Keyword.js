/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  Keyword = types.Keyword,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('Keyword', function () {
  it('returns an expression', function () {
    var expr = new Keyword('for');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones Keyword instances', function () {
    var src = new Keyword('for'),
      copy = new Keyword(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('wraps well-formed strings', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new Keyword(values[i]).toAQL()).to.equal(values[i].toUpperCase());
    }
  });
  it('does not accept malformed strings', function () {
    var values = [
      '-x',
      'in-valid',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new Keyword(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Identifier('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new Keyword(values[i]);}).to.throwException(isAqlError);
    }
  });
});