/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  IntegerLiteral = types.IntegerLiteral,
  NumberLiteral = types.NumberLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('IntegerLiteral', function () {
  it('returns an expression', function () {
    var expr = new IntegerLiteral(1);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('wraps numeric integer values', function () {
    var values = [
      [0, '0'],
      [42, '42'],
      [-23, '-23'],
      [false, '0'],
      [true, '1'],
      ['', '0'],
      [[], '0'],
      ['0xabcd', String(0xabcd)],
      ['0', '0'],
      ['42', '42'],
      ['1.0', '1'],
      ['-23', '-23']
    ];
    for (var i = 0; i < values.length; i++) {
      var n = new IntegerLiteral(values[i][0]);
      expect(n.toAQL()).to.equal(String(values[i][1]));
    }
  });
  it('does not accept numeric non-integer values', function () {
    var values = [1.5, '1.5', -0.01, '-0.01'];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new IntegerLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('clones IntegerLiteral instances', function () {
    var src = new IntegerLiteral(42),
      copy = new IntegerLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('clones integer NumberLiteral instances', function () {
    var src = new NumberLiteral(42),
      copy = new IntegerLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('does not accept non-integer NumberLiteral instances', function () {
    var values = [new NumberLiteral(1.5), new NumberLiteral(-0.01)];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new IntegerLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept NaN', function () {
    expect(function () {new IntegerLiteral(NaN);}).to.throwException(isAqlError);
  });
  it('does not accept Infinity', function () {
    expect(function () {new IntegerLiteral(Infinity);}).to.throwException(isAqlError);
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
      expect(function () {new IntegerLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
});