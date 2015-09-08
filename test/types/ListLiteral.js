/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ListLiteral = types.ListLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ListLiteral', function () {
  it('returns an expression', function () {
    var expr = new ListLiteral([]);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones ListLiteral instances', function () {
    var src = new ListLiteral([1, 2, 3]),
      copy = new ListLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('wraps arrays', function () {
    var arr = [1, 2, 3, 4];
    var expr = new ListLiteral(arr);
    expect(expr._value).to.be.an(Array);
    expect(expr._value.length).to.equal(arr.length);
  });
  it('auto-casts array values', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new ListLiteral(arr);
    for (var i = 0; i < arr.length; i++) {
      expect(expr._value[i].constructor).to.equal(ctors[i]);
    }
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
      expect(function () {return new ListLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new ListLiteral([op]).toAQL()).to.equal('[(x)]');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new ListLiteral([st]).toAQL()).to.equal('[(x)]');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new ListLiteral([ps]).toAQL()).to.equal('[(x)]');
  });
});