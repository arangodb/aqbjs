/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  UpsertExpression = types.UpsertExpression;

describe.skip('UpsertExpression', function () {
  it('returns a statement', function () {
    var expr = new UpsertExpression(null, 'x', 'y');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an UPSERT statement', function () {
    expect(new UpsertExpression(null, 'x', 'y').toAQL()).to.equal('UPSERT x INSERT y');
  });
  it('auto-casts expressions', function () {
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
      expect(new UpsertExpression(null, arr[i], 'y').upsertExpr.constructor).to.equal(ctors[i]);
      expect(new UpsertExpression(null, 'x', arr[i]).insertExpr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new UpsertExpression(null, op, 'y').toAQL()).to.equal('UPSERT (x) INSERT y');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new UpsertExpression(null, st, 'y').toAQL()).to.equal('UPSERT (x) INSERT y');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new UpsertExpression(null, ps, 'y').toAQL()).to.equal('UPSERT (x) INSERT y');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new UpsertExpression(ps, 'x', 'y').toAQL()).to.equal('$ UPSERT x INSERT y');
  });
});
