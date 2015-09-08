/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  LetExpression = types.LetExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('LetExpression', function () {
  it('returns a partial statement', function () {
    var expr = new LetExpression(null, {x: 'y'});
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a LET statement', function () {
    expect(new LetExpression(null, {x: 'y'}).toAQL()).to.equal('LET x = y');
  });
  it('auto-casts assignment values', function () {
    expect(new LetExpression(null, {a: 42})._dfns._dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new LetExpression(null, dfns);
    for (var i = 0; i < dfns.length; i++) {
      expect(expr._dfns._dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new LetExpression(null, [['a', 23], ['b', 42]]).toAQL()).to.equal('LET a = 23, b = 42');
  });
  it('does not accept empty assignments', function () {
    expect(function () {return new LetExpression(null, {});}).to.throwException(isAqlError);
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
      expect(function () {return new LetExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new LetExpression(null, {x: op}).toAQL()).to.equal('LET x = (y)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new LetExpression(null, {x: st}).toAQL()).to.equal('LET x = (y)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new LetExpression(null, {x: ps}).toAQL()).to.equal('LET x = (y)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new LetExpression(ps, {x: 'y'}).toAQL()).to.equal('$ LET x = y');
  });
});
