/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  NullLiteral = types.NullLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('NullLiteral', function () {
  it('returns an expression', function () {
    var expr = new NullLiteral(null);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('accepts null and wraps it as "null"', function () {
    expect(new NullLiteral(null).toAQL()).to.equal('null');
  });
  it('accepts undefined and wraps it as "null"', function () {
    expect(new NullLiteral(undefined).toAQL()).to.equal('null');
  });
  it('clones NullLiteral instances', function () {
    var src = new NullLiteral(null),
      copy = new NullLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('does not accept falsey values', function () {
    var values = [false, 0, ''];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new NullLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values', function () {
    var values = [
      'a simple string',
      42,
      true,
      {an: 'object', 'with': {things: 'in it'}},
      ['an', 'array', '||', 2],
      function also() {return this;}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new NullLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
});