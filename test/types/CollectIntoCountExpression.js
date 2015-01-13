/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectIntoCountExpression = types._CollectIntoCountExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectIntoCountExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectIntoCountExpression(null, {x: 'y'}, 'z');
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COLLECT statement', function () {
    expect(new CollectIntoCountExpression(null, {x: 'y'}, 'z').toAQL()).to.equal('COLLECT x = y INTO z COUNT');
  });
  it('auto-casts assignment values', function () {
    expect(new CollectIntoCountExpression(null, {a: 42}, 'z').dfns.dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectIntoCountExpression(null, dfns, 'z');
    for (var i = 0; i < dfns.length; i++) {
      expect(expr.dfns.dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new CollectIntoCountExpression(null, [['a', 23], ['b', 42]], 'z').toAQL()).to.equal('COLLECT a = 23, b = 42 INTO z COUNT');
  });
  it('does not accept empty assignments', function () {
    expect(function () {return new CollectIntoCountExpression(null, {}, 'z');}).to.throwException(isAqlError);
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
      expect(function () {return new CollectIntoCountExpression(null, values[i], 'z');}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new CollectIntoCountExpression(null, {x: op}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z COUNT');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new CollectIntoCountExpression(null, {x: st}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z COUNT');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new CollectIntoCountExpression(null, {x: ps}, 'z').toAQL()).to.equal('COLLECT x = (y) INTO z COUNT');
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
      expect(new CollectIntoCountExpression(null, {x: 'y'}, values[i]).varname.toAQL()).to.equal(values[i]);
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
      expect(function () {return new CollectIntoCountExpression(null, {x: 'y'}, values[i]);}).to.throwException(isAqlError);
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
      expect(function () {return new CollectIntoCountExpression(null, {x: 'y'}, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectIntoCountExpression(ps, {x: 'y'}, 'z').toAQL()).to.equal('$ COLLECT x = y INTO z COUNT');
  });
});