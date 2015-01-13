/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectIntoExpression = types._CollectIntoExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectIntoExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectIntoExpression(null, 'z');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an INTO statement', function () {
    expect(new CollectIntoExpression(null, 'z').toAQL()).to.equal('INTO z');
  });
  it('wraps well-formed strings as variable names', function () {
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
      expect(new CollectIntoExpression(null, values[i]).varname.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as variable names', function () {
    var values = [
      '',
      '-x',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new CollectIntoExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as variable names', function () {
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
      expect(function () {return new CollectIntoExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectIntoExpression(ps, 'z').toAQL()).to.equal('$ INTO z');
  });
  describe('count', function () {
    var expr = new CollectIntoExpression(null, 'x');
    it('returns a CollectCountExpression', function () {
      var countExpr = expr.count();
      expect(countExpr).to.be.a(types._CollectCountExpression);
      expect(countExpr.prev).to.equal(expr);
      expect(countExpr.toAQL).to.be.a('function');
    });
  });
  describe('keep', function () {
    var expr = new CollectIntoExpression(null, 'x');
    it('returns a CollectKeepExpression', function () {
      var keepExpr = expr.keep('a', 'b');
      expect(keepExpr).to.be.a(types._CollectKeepExpression);
      expect(keepExpr.prev).to.equal(expr);
      expect(keepExpr.toAQL).to.be.a('function');
      expect(keepExpr.args).to.be.an(Array);
    });
  });
});