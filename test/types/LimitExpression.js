/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  LimitExpression = types.LimitExpression;

describe('LimitExpression', function () {
  it('returns a partial statement', function () {
    var expr = new LimitExpression(null, 'x', 'y');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a LIMIT statement', function () {
    expect(new LimitExpression(null, 'x', 'y').toAQL()).to.equal('LIMIT x, y');
  });
  it('treats the offset as optional', function () {
    expect(new LimitExpression(null, 'x', 'y')._offset._value).to.equal('x');
    expect(new LimitExpression(null, 'x', 'y')._count._value).to.equal('y');
    expect(new LimitExpression(null, 'y')._count._value).to.equal('y');
  });
  it('auto-casts offsets', function () {
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
      expect(new LimitExpression(null, arr[i], 'y')._offset.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation offsets in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new LimitExpression(null, op, 'y').toAQL()).to.equal('LIMIT (x), y');
  });
  it('wraps Statement offsets in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new LimitExpression(null, st, 'y').toAQL()).to.equal('LIMIT (x), y');
  });
  it('wraps PartialStatement offsets in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new LimitExpression(null, ps, 'y').toAQL()).to.equal('LIMIT (x), y');
  });
  it('auto-casts counts', function () {
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
      expect(new LimitExpression(null, 'x', arr[i])._count.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation counts in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new LimitExpression(null, 'x', op).toAQL()).to.equal('LIMIT x, (y)');
  });
  it('wraps Statement counts in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new LimitExpression(null, 'x', st).toAQL()).to.equal('LIMIT x, (y)');
  });
  it('wraps PartialStatement counts in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new LimitExpression(null, 'x', ps).toAQL()).to.equal('LIMIT x, (y)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new LimitExpression(ps, 'x', 'y').toAQL()).to.equal('$ LIMIT x, y');
  });
});
