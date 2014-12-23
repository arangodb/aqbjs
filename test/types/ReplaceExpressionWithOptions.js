/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ReplaceExpressionWithOptions = types._ReplaceExpressionWithOptions,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ReplaceExpressionWithOptions', function () {
  it('returns a statement', function () {
    var expr = new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', 'a');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an REPLACE statement', function () {
    expect(new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', 'a').toAQL()).to.equal('REPLACE x WITH y IN z OPTIONS a');
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
      expect(new ReplaceExpressionWithOptions(null, arr[i], 'y', 'z', 'a').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new ReplaceExpressionWithOptions(null, op, 'y', 'z', 'a').toAQL()).to.equal('REPLACE (x) WITH y IN z OPTIONS a');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new ReplaceExpressionWithOptions(null, st, 'y', 'z', 'a').toAQL()).to.equal('REPLACE (x) WITH y IN z OPTIONS a');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new ReplaceExpressionWithOptions(null, ps, 'y', 'z', 'a').toAQL()).to.equal('REPLACE (x) WITH y IN z OPTIONS a');
  });
  it('allows omitting with-expressions', function () {
    expect(new ReplaceExpressionWithOptions(null, 'x', undefined, 'z', 'a').toAQL()).to.equal('REPLACE x IN z OPTIONS a');
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
      expect(new ReplaceExpressionWithOptions(null, 'x', arr[i], 'z', 'a').withExpr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation with-expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new ReplaceExpressionWithOptions(null, 'x', op, 'z', 'a').toAQL()).to.equal('REPLACE x WITH (y) IN z OPTIONS a');
  });
  it('wraps Statement with-expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new ReplaceExpressionWithOptions(null, 'x', st, 'z', 'a').toAQL()).to.equal('REPLACE x WITH (y) IN z OPTIONS a');
  });
  it('wraps PartialStatement with-expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new ReplaceExpressionWithOptions(null, 'x', ps, 'z', 'a').toAQL()).to.equal('REPLACE x WITH (y) IN z OPTIONS a');
  });
  it('wraps well-formed strings as collection names', function () {
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
      expect(new ReplaceExpressionWithOptions(null, 'x', 'y', values[i], 'a').collection.toAQL()).to.equal(values[i]);
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
      expect(function () {new ReplaceExpressionWithOptions(null, 'x', 'y', values[i], 'a');}).to.throwException(isAqlError);
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
      expect(function () {new ReplaceExpressionWithOptions(null, 'x', 'y', values[i], 'a');}).to.throwException(isAqlError);
    }
  });
  it('auto-casts options', function () {
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
      expect(new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', arr[i]).opts.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation options in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'a';};
    expect(new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', op).toAQL()).to.equal('REPLACE x WITH y IN z OPTIONS (a)');
  });
  it('wraps Statement options in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'a';};
    expect(new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', st).toAQL()).to.equal('REPLACE x WITH y IN z OPTIONS (a)');
  });
  it('wraps PartialStatement options in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'a';};
    expect(new ReplaceExpressionWithOptions(null, 'x', 'y', 'z', ps).toAQL()).to.equal('REPLACE x WITH y IN z OPTIONS (a)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new ReplaceExpressionWithOptions(ps, 'x', 'y', 'z', 'a').toAQL()).to.equal('$ REPLACE x WITH y IN z OPTIONS a');
  });
});