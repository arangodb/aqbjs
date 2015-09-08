/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  PropertyAccess = types.PropertyAccess;

describe('PropertyAccess', function () {
  it('returns an expression', function () {
    var expr = new PropertyAccess('a', 'b');
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
      var expr = new PropertyAccess(arr[i], arr[i]);
      expect(expr._obj.constructor).to.equal(ctors[i]);
      expect(expr._key.constructor).to.equal(ctors[i]);
    }
  });
});