/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  RangeExpression = types.RangeExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('RangeExpression', function () {
  it('returns an expression', function () {
    var expr = new RangeExpression(0, 1);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('auto-casts its arguments', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null, '1..5'];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral,
      types.RangeExpression
    ];
    for (var i = 0; i < arr.length; i++) {
      var expr = new RangeExpression(arr[i], arr[i]);
      expect(expr.start.constructor).to.equal(ctors[i]);
      expect(expr.end.constructor).to.equal(ctors[i]);
    }
  });
});