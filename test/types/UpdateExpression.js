/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  UpdateExpression = types.UpdateExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('UpdateExpression', function () {
  it('returns a statement', function () {
    var expr = new UpdateExpression(null, 'x', 'y', 'z');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an UPDATE statement', function () {
    expect(new UpdateExpression(null, 'x', 'y', 'z').toAQL()).to.equal('UPDATE x WITH y IN z');
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
      expect(new UpdateExpression(null, arr[i], 'y', 'z').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, op, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, st, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, ps, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('allows omitting with-expressions', function () {
    expect(new UpdateExpression(null, 'x', undefined, 'z').toAQL()).to.equal('UPDATE x IN z');
  });
  it('auto-casts with-expressions', function () {
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
      expect(new UpdateExpression(null, 'x', arr[i], 'z').withExpr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation with-expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', op, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
  });
  it('wraps Statement with-expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', st, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
  });
  it('wraps PartialStatement with-expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', ps, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
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
      expect(new UpdateExpression(null, 'x', 'y', values[i]).collection.toAQL()).to.equal(values[i]);
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
      expect(function () {return new UpdateExpression(null, 'x', 'y', values[i]);}).to.throwException(isAqlError);
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
      expect(function () {return new UpdateExpression(null, 'x', 'y', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new UpdateExpression(ps, 'x', 'y', 'z').toAQL()).to.equal('$ UPDATE x WITH y IN z');
  });
  describe('options', function () {
    var expr = new UpdateExpression(null, 'x', 'y', 'z');
    it('returns an OptionsExpression', function () {
      var optExpr = expr.options('a');
      expect(optExpr).to.be.a(types._OptionsExpression);
      expect(optExpr.toAQL).to.be.a('function');
      expect(optExpr.opts.value).to.equal('a');
    });
  });
});
