/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  CollectExpression = types.CollectExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('CollectExpression', function () {
  it('returns a partial statement', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    expect(expr).to.be.a(types._PartialStatement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a COLLECT statement', function () {
    expect(new CollectExpression(null, {x: 'y'}).toAQL()).to.equal('COLLECT x = y');
  });
  it('auto-casts assignment values', function () {
    expect(new CollectExpression(null, {a: 42})._dfns._dfns[0][1].constructor).to.equal(types.IntegerLiteral);
    var dfns = [['a', 42], ['b', 'id'], ['c', 'some.ref'], ['d', '"hello"'], ['e', false], ['f', null]];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new CollectExpression(null, dfns);
    for (var i = 0; i < dfns.length; i++) {
      expect(expr._dfns._dfns[i][1].constructor).to.equal(ctors[i]);
    }
  });
  it('accepts array assignments', function () {
    expect(new CollectExpression(null, [['a', 23], ['b', 42]]).toAQL()).to.equal('COLLECT a = 23, b = 42');
  });
  it('does not accept empty assignments', function () {
    expect(function () {return new CollectExpression(null, {});}).to.throwException(isAqlError);
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
      expect(function () {return new CollectExpression(null, values[i]);}).to.throwException(isAqlError);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: op}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: st}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new CollectExpression(null, {x: ps}).toAQL()).to.equal('COLLECT x = (y)');
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new CollectExpression(ps, {x: 'y'}).toAQL()).to.equal('$ COLLECT x = y');
  });
  describe('into(var)', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    var expr2 = expr.into('z');
    it('returns a new CollectExpression', function () {
      expect(expr2).to.be.a(CollectExpression);
      expect(expr2.toAQL()).to.equal('COLLECT x = y INTO z');
    });
    describe('keep', function () {
      var expr3 = expr2.keep();
      it('returns a new CollectExpression', function () {
        expect(expr3).to.be.a(CollectExpression);
        expect(expr3.toAQL()).to.equal('COLLECT x = y INTO z KEEP');
      });
      describe('options', function () {
        it('returns a new CollectExpression', function () {
          var optExpr = expr3.options({c: 'd'});
          expect(optExpr).to.be.a(types.CollectExpression);
          expect(optExpr.toAQL()).to.equal('COLLECT x = y INTO z KEEP OPTIONS {c: d}');
        });
      });
    });
    describe('options', function () {
      it('returns a new CollectExpression', function () {
        var optExpr = expr2.options({c: 'd'});
        expect(optExpr).to.be.a(types.CollectExpression);
        expect(optExpr.toAQL()).to.equal('COLLECT x = y INTO z OPTIONS {c: d}');
      });
    });
  });
  describe('into(var, expr)', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    var expr2 = expr.into('z', {a: 'b'});
    it('returns a new CollectExpression', function () {
      expect(expr2).to.be.a(CollectExpression);
      expect(expr2.toAQL()).to.equal('COLLECT x = y INTO z = {a: b}');
    });
    describe('options', function () {
      it('returns a new CollectExpression', function () {
        var optExpr = expr2.options({c: 'd'});
        expect(optExpr).to.be.a(types.CollectExpression);
        expect(optExpr.toAQL()).to.equal('COLLECT x = y INTO z = {a: b} OPTIONS {c: d}');
      });
    });
  });
  describe('withCountInto(var)', function () {
    it('returns a new CollectWithCountIntoExpression', function () {
      var expr = new CollectExpression(null, {x: 'y'});
      var expr2 = expr.withCountInto('z');
      expect(expr2).to.be.a(types.CollectWithCountIntoExpression);
      expect(expr2.toAQL()).to.equal('COLLECT x = y WITH COUNT INTO z');
    });
  });
  describe('options', function () {
    var expr = new CollectExpression(null, {x: 'y'});
    it('returns a new CollectExpression', function () {
      var optExpr = expr.options({c: 'd'});
      expect(optExpr).to.be.a(types.CollectExpression);
      expect(optExpr.toAQL()).to.equal('COLLECT x = y OPTIONS {c: d}');
    });
  });
});