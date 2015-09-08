/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectWithCountIntoExpression = types.CollectWithCountIntoExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectWithCountIntoExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectWithCountIntoExpression(null, null, 'z');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COLLECT statement', function () {
    expect(new CollectWithCountIntoExpression(null, null, 'z').toAQL()).to.equal('COLLECT WITH COUNT INTO z');
    expect(new CollectWithCountIntoExpression(null, {x: 'y'}, 'z').toAQL()).to.equal('COLLECT x = y WITH COUNT INTO z');
  });
  it('auto-casts assignment values', function () {
    expect(new CollectWithCountIntoExpression(null, {a: 42}, 'z')._dfns._dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectWithCountIntoExpression(null, dfns, 'z');
    for (var i = 0; i < dfns.length; i++) {
      expect(expr._dfns._dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new CollectWithCountIntoExpression(null, [['a', 23], ['b', 42]], 'z').toAQL()).to.equal('COLLECT a = 23, b = 42 WITH COUNT INTO z');
  });
  it('accepts empty assignments', function () {
    var values = [
      undefined,
      null,
      false
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new CollectWithCountIntoExpression(null, values[i], 'z').toAQL()).to.equal('COLLECT WITH COUNT INTO z');
    }
  });
  it('does not accept non-object assignments', function () {
    var values = [
      42,
      'hello',
      function () {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new CollectWithCountIntoExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new CollectWithCountIntoExpression(null, {x: op}, 'z').toAQL()).to.equal('COLLECT x = (y) WITH COUNT INTO z');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new CollectWithCountIntoExpression(null, {x: st}, 'z').toAQL()).to.equal('COLLECT x = (y) WITH COUNT INTO z');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new CollectWithCountIntoExpression(null, {x: ps}, 'z').toAQL()).to.equal('COLLECT x = (y) WITH COUNT INTO z');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectWithCountIntoExpression(ps, {x: 'y'}, 'z').toAQL()).to.equal('$ COLLECT x = y WITH COUNT INTO z');
  });
  describe('options', function () {
    var expr = new CollectWithCountIntoExpression(null, {x: 'y'}, 'z');
    it('returns a new CollectWithCountIntoExpression', function () {
      var optExpr = expr.options({c: 'd'});
      expect(optExpr).to.be.a(types.CollectWithCountIntoExpression);
      expect(optExpr.toAQL()).to.equal('COLLECT x = y WITH COUNT INTO z OPTIONS {c: d}');
    });
  });
});