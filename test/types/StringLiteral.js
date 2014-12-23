/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  StringLiteral = types.StringLiteral;

describe('StringLiteral', function () {
  it('returns an expression', function () {
    var expr = new StringLiteral('');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones StringLiteral instances', function () {
    var src = new StringLiteral('hello'),
      copy = new StringLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('wraps the AQL value of objects that have a toAQL method', function () {
    var values = [
      new types.IntegerLiteral(23),
      new types.NullLiteral(null),
      new types.ForExpression(null, 'x', 'foo'),
      {toAQL: function () {return 'yes please';}}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new StringLiteral(values[i]).value).to.equal(values[i].toAQL());
    }
  });
  it('wraps any other value as a string', function () {
    var values = [
      'a simple string',
      42,
      true,
      {an: 'object', 'with': {things: 'in it'}},
      ['an', 'array', '||', 2],
      function also() {return this;}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new StringLiteral(values[i]).value).to.equal(String(values[i]));
    }
  });
});