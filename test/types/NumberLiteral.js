/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  NumberLiteral = types.NumberLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('NumberLiteral', function () {
  it('returns an expression', function () {
    var expr = new NumberLiteral(1);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('wraps numeric values', function () {
    var values = [
      [0, '0'],
      [42, '42'],
      [1.5, '1.5'],
      [-23, '-23'],
      [-0.01, '-0.01'],
      [false, '0'],
      [true, '1'],
      ['', '0'],
      [[], '0'],
      ['0xabcd', String(0xabcd)],
      ['0', '0'],
      ['42', '42'],
      ['1.0', '1'],
      ['1.5', '1.5'],
      ['-23', '-23'],
      ['-0.01', '-0.01']
    ];
    for (var i = 0; i < values.length; i++) {
      var n = new NumberLiteral(values[i][0]);
      expect(n.toAQL()).to.equal(String(values[i][1]));
    }
  });
  it('clones NumberLiteral instances', function () {
    var src = new NumberLiteral(42),
      copy = new NumberLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('clones IntegerLiteral instances', function () {
    var src = new types.IntegerLiteral(42),
      copy = new NumberLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('does not accept NaN', function () {
    expect(function () {new NumberLiteral(NaN);}).to.throwException(isAqlError);
  });
  it('does not accept Infinity', function () {
    expect(function () {new NumberLiteral(Infinity);}).to.throwException(isAqlError);
  });
  it('does not accept non-numeric values', function () {
    var values = [
      '0xabsurd',
      'hello',
      /absurd/,
      function () {},
      {0: 1},
      [1, 2, 3],
      {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new NumberLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
});