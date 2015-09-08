/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  FilterExpression = types.FilterExpression;

describe('FilterExpression', function () {
  it('returns a partial statement', function () {
    var expr = new FilterExpression(null, 'x');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a FILTER statement', function () {
    expect(new FilterExpression(null, 'x').toAQL()).to.equal('FILTER x');
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
      expect(new FilterExpression(null, arr[i])._expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new FilterExpression(null, op).toAQL()).to.equal('FILTER (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new FilterExpression(null, st).toAQL()).to.equal('FILTER (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new FilterExpression(null, ps).toAQL()).to.equal('FILTER (x)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new FilterExpression(ps, 'x').toAQL()).to.equal('$ FILTER x');
  });
});
