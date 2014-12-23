/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
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
  it('quotes unsafe keys in AQL', function () {
    expect(new ObjectLiteral({a: 'b'}).toAQL()).to.equal('{a: b}');
    expect(new ObjectLiteral({0: 'b'}).toAQL()).to.equal('{0: b}');
    expect(new ObjectLiteral({' a': 'b'}).toAQL()).to.equal('{" a": b}');
    expect(new ObjectLiteral({'0a': 'b'}).toAQL()).to.equal('{"0a": b}');
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new ObjectLiteral({an: op}).toAQL()).to.equal('{an: (x)}');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new ObjectLiteral({an: st}).toAQL()).to.equal('{an: (x)}');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new ObjectLiteral({an: ps}).toAQL()).to.equal('{an: (x)}');
  });
});