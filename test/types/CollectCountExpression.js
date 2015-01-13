/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectCountExpression = types._CollectCountExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectCountExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectCountExpression();
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COUNT statement', function () {
    expect(new CollectCountExpression(null).toAQL()).to.equal('COUNT');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectCountExpression(ps).toAQL()).to.equal('$ COUNT');
  });
  describe('keep', function () {
    var expr = new CollectCountExpression(null);
    it('returns a CollectKeepExpression', function () {
      var keepExpr = expr.keep('a', 'b');
      expect(keepExpr).to.be.a(types._CollectKeepExpression);
      expect(keepExpr.prev).to.equal(expr);
      expect(keepExpr.toAQL).to.be.a('function');
      expect(keepExpr.args).to.be.an(Array);
    });
  });
});