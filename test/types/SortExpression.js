/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  SortExpression = types.SortExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('SortExpression', function () {
  it('returns a partial statement', function () {
    var expr = new SortExpression(null, ['x']);
    expect(expr).to.be.an(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a SORT statement', function () {
    expect(new SortExpression(null, ['x']).toAQL()).to.equal('SORT x');
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
    var expr = new SortExpression(null, arr);
    for (var i = 0; i < arr.length; i++) {
      expect(expr.args[i].constructor).to.equal(ctors[i]);
    }
  });
  it('does not accept empty values', function () {
    expect(function () {new SortExpression(null, []);}).to.throwException(isAqlError);
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
      expect(function () {new SortExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('accepts ASC/DESC keywords', function () {
    var expr = new SortExpression(null, ['x', 'ASC', 'y', 'z', 'DESC']);
    expect(expr.toAQL()).to.equal('SORT x ASC, y, z DESC');
    expect(expr.args[1].constructor).to.equal(types.Keyword);
    expect(expr.args[4].constructor).to.equal(types.Keyword);
  });
  it('does not accept keywords in unexpected positions', function () {
    var values = [
      ['ASC'],
      ['ASC', 'x'],
      ['x', 'ASC', 'DESC'],
      ['ASC', 'DESC']
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new SortExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new SortExpression(null, [op]).toAQL()).to.equal('SORT (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new SortExpression(null, [st]).toAQL()).to.equal('SORT (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new SortExpression(null, [ps]).toAQL()).to.equal('SORT (x)');
  });
});