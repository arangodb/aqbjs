/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ForExpression = types.ForExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ForExpression', function () {
  it('returns a statement', function () {
    var expr = new ForExpression(null, 'x', 'y');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a FOR statement', function () {
    expect(new ForExpression(null, 'x', 'y').toAQL()).to.equal('FOR x IN y');
  });
  it('wraps well-formed strings as variable names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'totally-radical',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new ForExpression(null, values[i], 'y').varname.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as variable names', function () {
    var values = [
      '',
      '-x',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new ForExpression(null, values[i], 'y');}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as variable names', function () {
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
      expect(function () {new ForExpression(null, values[i], 'y');}).to.throwException(isAqlError);
    }
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
      expect(new ForExpression(null, 'x', arr[i]).expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new ForExpression(null, 'x', op).toAQL()).to.equal('FOR x IN (y)');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new ForExpression(null, 'x', st).toAQL()).to.equal('FOR x IN (y)');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new ForExpression(null, 'x', ps).toAQL()).to.equal('FOR x IN (y)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new ForExpression(ps, 'x', 'y').toAQL()).to.equal('$ FOR x IN y');
  });
});