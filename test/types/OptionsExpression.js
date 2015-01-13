/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  OptionsExpression = types._OptionsExpression;

describe('OptionsExpression', function () {
  it('returns a statement', function () {
    var expr = new OptionsExpression(null, 'a');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an OPTIONS statement', function () {
    expect(new OptionsExpression(null, 'a').toAQL()).to.equal('OPTIONS a');
  });
  it('auto-casts options', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new OptionsExpression(null, arr[i]).opts.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation options in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'a';};
    expect(new OptionsExpression(null, op).toAQL()).to.equal('OPTIONS (a)');
  });
  it('wraps Statement options in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'a';};
    expect(new OptionsExpression(null, st).toAQL()).to.equal('OPTIONS (a)');
  });
  it('wraps PartialStatement options in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'a';};
    expect(new OptionsExpression(null, ps).toAQL()).to.equal('OPTIONS (a)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new OptionsExpression(ps, 'a').toAQL()).to.equal('$ OPTIONS a');
  });
});