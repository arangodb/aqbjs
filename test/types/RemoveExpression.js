/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  RemoveExpression = types.RemoveExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('RemoveExpression', function () {
  it('returns a statement', function () {
    var expr = new RemoveExpression(null, 'x', 'y');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a REMOVE statement', function () {
    expect(new RemoveExpression(null, 'x', 'y').toAQL()).to.equal('REMOVE x IN y');
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
      expect(new RemoveExpression(null, arr[i], 'y').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, op, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, st, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, ps, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps well-formed strings as collection names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new RemoveExpression(null, 'x', values[i]).collection.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as collection names', function () {
    var values = [
      '',
      '-x',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new RemoveExpression(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as collection names', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new RemoveExpression(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new RemoveExpression(ps, 'x', 'y').toAQL()).to.equal('$ REMOVE x IN y');
  });
  describe('options', function () {
    var expr = new RemoveExpression(null, 'x', 'y');
    it('returns an OptionsExpression', function () {
      var optExpr = expr.options('a');
      expect(optExpr).to.be.a(types._OptionsExpression);
      expect(optExpr.toAQL).to.be.a('function');
      expect(optExpr.opts.value).to.equal('a');
    });
  });
  describe('returnOld', function () {
    var expr = new RemoveExpression(null, 'x', 'y');
    it('returns a LetReturnExpression', function () {
      var rtrnExpr = expr.returnOld('a');
      expect(rtrnExpr).to.be.a(types._LetReturnExpression);
      expect(rtrnExpr.toAQL).to.be.a('function');
      expect(rtrnExpr.varname.value).to.equal('a');
      expect(rtrnExpr.keyword.value).to.equal('OLD');
    });
  });
});
