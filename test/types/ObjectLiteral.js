/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ObjectLiteral = types.ObjectLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ObjectLiteral', function () {
  it('returns an expression', function () {
    var expr = new ObjectLiteral({});
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones ObjectLiteral instances', function () {
    var src = new ObjectLiteral({a: 1, b: 2, c: 3}),
      copy = new ObjectLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('wraps objects', function () {
    var obj = {a: 1, b: 2, c: 3};
    var expr = new ObjectLiteral(obj);
    expect(expr.value).to.be.an(Object);
    expect(Object.keys(expr.value)).to.eql(Object.keys(obj));
  });
  it('auto-casts object values', function () {
    var obj = {a: 42, b: 'id', c: 'some.ref', d: '"hello"', e: false, f: null};
    var ctors = {
      a: types.IntegerLiteral,
      b: types.Identifier,
      c: types.SimpleReference,
      d: types.StringLiteral,
      e: types.BooleanLiteral,
      f: types.NullLiteral
    };
    var expr = new ObjectLiteral(obj);
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        expect(expr.value[key].constructor).to.equal(ctors[key]);
      }
    }
  });
  it('does not accept non-object values', function () {
    var values = [
      undefined,
      null,
      42,
      false,
      'hello',
      function () {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new ObjectLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
});