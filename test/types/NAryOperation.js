/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  NAryOperation = types.NAryOperation,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('NAryOperation', function () {
  it('returns an expression', function () {
    var expr = new NAryOperation('+', ['x', 'y']);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('accepts non-empty strings as operators', function () {
    var values = [
      '-',
      '~',
      '+',
      'not',
      'nöis3',
      '$$ $$%§-äß',
      'bad:bad:bad'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new NAryOperation(values[i], ['x', 'y']).toAQL()).to.equal('x ' + values[i] + ' y');
    }
  });
  it('does not accept any other values as operators', function () {
    var values = [
      '',
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
      expect(function () {new NAryOperation(values[i], ['x', 'y']);}).to.throwException(isAqlError);
    }
  });
  it('auto-casts values', function () {
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
      var op = new NAryOperation('+', [arr[i], arr[i]]);
      expect(op.values[0].constructor).to.equal(ctors[i]);
      expect(op.values[1].constructor).to.equal(ctors[i]);
    }
  });
  it('allows an arbitrary number of values', function () {
    expect(new NAryOperation('+', [1]).toAQL()).to.equal('1');
    expect(new NAryOperation('+', [1, 2]).toAQL()).to.equal('1 + 2');
    expect(new NAryOperation('+', [1, 2, 3]).toAQL()).to.equal('1 + 2 + 3');
    expect(new NAryOperation('+', [1, 2, 3, 4]).toAQL()).to.equal('1 + 2 + 3 + 4');
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new NAryOperation('+', [op, op]).toAQL()).to.equal('(x) + (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new NAryOperation('+', [st, st]).toAQL()).to.equal('(x) + (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new NAryOperation('+', [ps, ps]).toAQL()).to.equal('(x) + (x)');
  });
});