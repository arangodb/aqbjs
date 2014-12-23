/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  Definitions = types._Definitions,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('Definitions', function () {
  it('wraps object assignments', function () {
    var obj = {a: 1, b: 2, c: 3};
    var expr = new Definitions(obj);
    expect(expr.dfns).to.be.an('array');
    for (var i = 0; i < expr.dfns.length; i++) {
      expect(obj[expr.dfns[i][0].value]).to.equal(expr.dfns[i][1].value);
    }
  });
  it('accepts array assignments', function () {
    expect(new Definitions([['a', 23], ['b', 42]]).toAQL()).to.equal('a = 23, b = 42');
  });
  it('does not accept empty assignments', function () {
    expect(function () {new Definitions({});}).to.throwException(isAqlError);
  });
  it('auto-casts assignment values', function () {
    expect(new Definitions({a: 42}).dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new Definitions(dfns);
    for (var i = 0; i < dfns.length; i++) {
      expect(expr.dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('does not accept non-object assignments', function () {
    var values = [
      undefined,
      null,
      42,
      false,
      'hello',
      function () {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new Definitions(values[i]);}).to.throwException(isAqlError);
    }
  });
  it('clones Definitions instances', function () {
    var src = new Definitions({a: 1, b: 2, c: 3}),
      copy = new Definitions(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('treats keys as identifiers in AQL', function () {
    var expr = new Definitions({a: 'b'});
    expect(expr.toAQL()).to.equal('a = b');
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new Definitions({an: op}).toAQL()).to.equal('an = (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new Definitions({an: st}).toAQL()).to.equal('an = (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new Definitions({an: ps}).toAQL()).to.equal('an = (x)');
  });
});