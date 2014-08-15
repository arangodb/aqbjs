/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ReturnExpression = types.ReturnExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ReturnExpression', function () {
  it('returns a statement', function () {
    var expr = new ReturnExpression(null, 'x');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a RETURN statement', function () {
    expect(new ReturnExpression(null, 'x').toAQL()).to.equal('RETURN x');
  });
  it('auto-casts values', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new ReturnExpression(null, arr[i]).value.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new ReturnExpression(null, op).toAQL()).to.equal('RETURN (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new ReturnExpression(null, st).toAQL()).to.equal('RETURN (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new ReturnExpression(null, ps).toAQL()).to.equal('RETURN (x)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new ReturnExpression(ps, 'x').toAQL()).to.equal('$ RETURN x');
  });
});
