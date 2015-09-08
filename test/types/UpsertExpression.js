/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  UpsertExpression = types.UpsertExpression;

describe('UpsertExpression', function () {
  it('returns a statement', function () {
    var expr = new UpsertExpression(null, 'x', 'y', false, 'z', 'c');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an UPSERT statement', function () {
    expect(new UpsertExpression(null, 'x', 'y', false, 'z', 'c').toAQL()).to.equal('UPSERT x INSERT y UPDATE z IN c');
    expect(new UpsertExpression(null, 'x', 'y', true, 'z', 'c').toAQL()).to.equal('UPSERT x INSERT y REPLACE z IN c');
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
      expect(new UpsertExpression(null, arr[i], 'y', false, 'z', 'c')._upsertExpr.constructor).to.equal(ctors[i]);
      expect(new UpsertExpression(null, 'x', arr[i], false, 'z', 'c')._insertExpr.constructor).to.equal(ctors[i]);
      expect(new UpsertExpression(null, 'x', 'y', false, arr[i], 'c')._updateOrReplaceExpr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new UpsertExpression(null, op, 'y', false, 'z', 'c').toAQL()).to.equal('UPSERT (x) INSERT y UPDATE z IN c');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new UpsertExpression(null, ps, 'y', false, 'z', 'c').toAQL()).to.equal('UPSERT (x) INSERT y UPDATE z IN c');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new UpsertExpression(ps, 'x', 'y', false, 'z', 'c').toAQL()).to.equal('$ UPSERT x INSERT y UPDATE z IN c');
  });
  describe('options', function () {
    var expr = new UpsertExpression(null, 'x', 'y', false, 'z', 'c');
    it('returns a new UpsertExpression', function () {
      var optExpr = expr.options({a: 'b'});
      expect(optExpr).to.be.a(types.UpsertExpression);
      expect(optExpr.toAQL()).to.equal('UPSERT x INSERT y UPDATE z IN c OPTIONS {a: b}');
    });
  });
  describe('returnOld', function () {
    var expr = new UpsertExpression(null, 'x', 'y', false, 'z', 'c');
    it('returns a LET RETURN OLD', function () {
      var rtrnExpr = expr.returnOld('a');
      expect(rtrnExpr).to.be.a(types.ReturnExpression);
      expect(rtrnExpr._value._value).to.equal('a');
      expect(rtrnExpr._prev).to.be.a(types.LetExpression);
      rtrnExpr._prev._prev = null;
      expect(rtrnExpr.toAQL()).to.equal('LET a = `OLD` RETURN a');
    });
  });
  describe('returnNew', function () {
    var expr = new UpsertExpression(null, 'x', 'y', false, 'z', 'c');
    it('returns a LET RETURN NEW', function () {
      var rtrnExpr = expr.returnNew('a');
      expect(rtrnExpr).to.be.a(types.ReturnExpression);
      expect(rtrnExpr._value._value).to.equal('a');
      expect(rtrnExpr._prev).to.be.a(types.LetExpression);
      rtrnExpr._prev._prev = null;
      expect(rtrnExpr.toAQL()).to.equal('LET a = `NEW` RETURN a');
    });
  });
});
