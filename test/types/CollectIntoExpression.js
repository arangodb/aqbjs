/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectIntoExpression = types._CollectIntoExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectIntoExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectIntoExpression(null, {x: 'y'}, 'z');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COLLECT statement', function () {
    expect(new CollectIntoExpression(null, {x: 'y'}, 'z').toAQL()).to.equal('COLLECT x = y INTO z');
  });
  it('auto-casts assignment values', function () {
    expect(new CollectIntoExpression(null, {a: 42}, 'z').dfns.dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectIntoExpression(null, dfns, 'z');
    for (var i = 0; i < dfns.length; i++) {
      expect(expr.dfns.dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new CollectIntoExpression(null, [['a', 23], ['b', 42]], 'z').toAQL()).to.equal('COLLECT a = 23, b = 42 INTO z');
  });
  it('does not accept empty assignments', function () {
    expect(function () {return new CollectIntoExpression(null, {}, 'z');}).to.throwException(isAqlError);
  });
  it('does not accept non-object assignments', function () {
    var values = [
      undefined,
      null,
      42,
      false,
      'hello',
      function () {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new CollectIntoExpression(null, values[i], 'z');}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new CollectIntoExpression(null, {x: op}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new CollectIntoExpression(null, {x: st}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new CollectIntoExpression(null, {x: ps}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z');
  });
  it('wraps well-formed strings as variable names', function () {
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
      expect(new CollectIntoExpression(null, {x: 'y'}, values[i]).varname.toAQL()).to.equal(values[i]);
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
      expect(function () {return new CollectIntoExpression(null, {x: 'y'}, values[i]);}).to.throwException(isAqlError);
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
      expect(function () {return new CollectIntoExpression(null, {x: 'y'}, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectIntoExpression(ps, {x: 'y'}, 'z').toAQL()).to.equal('$ COLLECT x = y INTO z');
  });
});