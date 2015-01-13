/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectExpression = types.CollectExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COLLECT statement', function () {
    expect(new CollectExpression(null, {x: 'y'}).toAQL()).to.equal('COLLECT x = y');
  });
  it('auto-casts assignment values', function () {
    expect(new CollectExpression(null, {a: 42}).dfns.dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectExpression(null, dfns);
    for (var i = 0; i < dfns.length; i++) {
      expect(expr.dfns.dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new CollectExpression(null, [['a', 23], ['b', 42]]).toAQL()).to.equal('COLLECT a = 23, b = 42');
  });
  it('does not accept empty assignments', function () {
    expect(function () {return new CollectExpression(null, {});}).to.throwException(isAqlError);
  });
  it('does not accept non-object assignments', function () {
    var values = [
      undefined,
      null,
      42,
      false,
      'hello',
      function () {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new CollectExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: op}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: st}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: ps}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectExpression(ps, {x: 'y'}).toAQL()).to.equal('$ COLLECT x = y');
  });
  describe('into', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    it('returns an CollectIntoExpression', function () {
      var optExpr = expr.into('a');
      expect(optExpr).to.be.a(types._CollectIntoExpression);
      expect(optExpr.toAQL).to.be.a('function');
      expect(optExpr.varname.value).to.equal('a');
    });
  });
  describe('keep', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    it('returns a CollectKeepExpression', function () {
      var keepExpr = expr.keep('a', 'b');
      expect(keepExpr).to.be.a(types._CollectKeepExpression);
      expect(keepExpr.prev).to.equal(expr);
      expect(keepExpr.toAQL).to.be.a('function');
      expect(keepExpr.args).to.be.an(Array);
    });
  });
});