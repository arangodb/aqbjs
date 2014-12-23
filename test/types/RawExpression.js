/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  RawExpression = types.RawExpression;

describe('RawExpression', function () {
  it('returns an expression', function () {
    var expr = new RawExpression('foo');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('takes any input and wraps it as a string', function () {
    var values = [
      'a simple string',
      'ä str!ŋ w/ b@d ¢ħrź##',
      0,
      42,
      true,
      null,
      false,
      undefined,
      {an: 'object', 'with': {things: 'in it'}},
      ['an', 'array', '||', 2],
      function also() {return this;}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new RawExpression(values[i]).toAQL()).to.equal(String(values[i]));
    }
  });
});