/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  UnaryOperation = types.UnaryOperation,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('UnaryOperation', function () {
  it('returns an expression', function () {
    var expr = new UnaryOperation('!', 'x');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('accepts non-empty strings as operators', function () {
    var values = [
      '-',
      '~',
      '!',
      'not',
      'nöis3',
      '$$ $$%§-äß',
      'bad:bad:bad'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new UnaryOperation(values[i], 'x').toAQL()).to.equal(values[i] + 'x');
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
      expect(function () {return new UnaryOperation(values[i], 'x');}).to.throwException(isAqlError);
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
      expect(new UnaryOperation('!', arr[i])._value.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new UnaryOperation('!', op).toAQL()).to.equal('!(x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new UnaryOperation('!', st).toAQL()).to.equal('!(x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new UnaryOperation('!', ps).toAQL()).to.equal('!(x)');
  });
});