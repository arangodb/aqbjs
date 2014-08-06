/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  BooleanLiteral = types.BooleanLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('BooleanLiteral', function () {
  it('returns an expression', function () {
    var expr = new BooleanLiteral(true);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('wraps truthy values', function () {
    var values = [
      'a non-empty string',
      42,
      true,
      {},
      [],
      function () {}
    ];
    for (var i = 0; i < values; i++) {
      expect(new BooleanLiteral(values[i]).toAQL()).to.equal('true');
    }
  });
  it('wraps falsey values', function () {
    var values = [
      '', // an empty string
      0,
      null,
      false,
      undefined
    ];
    for (var i = 0; i < values; i++) {
      expect(new BooleanLiteral(values[i]).toAQL()).to.equal('false');
    }
  });
  it('clones BooleanLiteral instances', function () {
    var src = new BooleanLiteral(false),
      copy = new BooleanLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
});