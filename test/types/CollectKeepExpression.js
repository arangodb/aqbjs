/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectKeepExpression = types._CollectKeepExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectKeepExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectKeepExpression(null, ['z']);
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a KEEP statement', function () {
    expect(new CollectKeepExpression(null, ['z']).toAQL()).to.equal('KEEP z');
  });
  it('auto-casts sort values', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectKeepExpression(null, arr);
    for (var i = 0; i < arr.length; i++) {
      expect(expr.args[i].constructor).to.equal(ctors[i]);
    }
  });
  it('does not accept empty values', function () {
    expect(function () {return new CollectKeepExpression(null, []);}).to.throwException(isAqlError);
  });
  it('does not accept non-array values', function () {
    var values = [
      (function () {return arguments;}()),
      {0: 'a', 1: 'b', 2: 'c'},
      new types.StringLiteral('abc'),
      42,
      false,
      'hello',
      /absurd/,
      function () {},
      {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new CollectKeepExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectKeepExpression(ps, ['z']).toAQL()).to.equal('$ KEEP z');
  });
});