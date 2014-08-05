/* jshint globalstrict: true, es3: true */
/* globals require: false, module: false, console: false */
'use strict';
var QB = {},
  AqlError = require('./errors').AqlError,
  types = require('./types'),
  warn;

warn = (function () {
  if (typeof console !== 'undefined') {
    return function () {return console.warn.apply(this, arguments);};
  }
  try {
    var cons = require('console');
    return function () {return cons.warn.apply(this, arguments);};
  } catch (err) {
    return function () {};
  }
}());

QB.let_ = QB['let'] = undefined;
QB.for_ = QB['for'] = undefined;
QB.return_ = QB['return'] = undefined;

QB.bool = function (value) {return new types.BooleanLiteral(value);};
QB.num = function (value) {return new types.NumberLiteral(value);};
QB.int_ = QB['int'] = function (value) {return new types.IntegerLiteral(value);};
QB.str = function (value) {return new types.StringLiteral(value);};
QB.list = function (arr) {return new types.ListLiteral(arr);};
QB.obj = function (obj) {return new types.ObjectLiteral(obj);};
QB.range = function (start, end) {return new types.RangeExpression(start, end);};
QB.get = function (obj, key) {return new types.PropertyAccess(obj, key);};
QB.ref = function (value) {return new types.SimpleReference(value);};
QB.expr = function (value) {return new types.RawExpression(value);};

QB.and = function (x, y) {return new types.BinaryOperation('&&', x, y);};
QB.or = function (x, y) {return new types.BinaryOperation('||', x, y);};
QB.add = function (x, y) {return new types.BinaryOperation('+', x, y);};
QB.sub = function (x, y) {return new types.BinaryOperation('-', x, y);};
QB.mul = function (x, y) {return new types.BinaryOperation('*', x, y);};
QB.div = function (x, y) {return new types.BinaryOperation('/', x, y);};
QB.mod = function (x, y) {return new types.BinaryOperation('%', x, y);};
QB.eq = function (x, y) {return new types.BinaryOperation('==', x, y);};
QB.gt = function (x, y) {return new types.BinaryOperation('>', x, y);};
QB.gte = function (x, y) {return new types.BinaryOperation('>=', x, y);};
QB.lt = function (x, y) {return new types.BinaryOperation('<', x, y);};
QB.lte = function (x, y) {return new types.BinaryOperation('<=', x, y);};
QB.neq = function (x, y) {return new types.BinaryOperation('!=', x, y);};
QB.not = function (x) {return new types.UnaryOperation('!', x);};
QB.in_ = QB['in'] = function (x, y) {return new types.BinaryOperation('in', x, y);};
QB.if_ = QB['if'] = function (x, y, z) {return new types.TernaryOperation('?', ':', x, y, z);};

QB.fn = function(functionName, arity) {
  if (typeof arity === 'number') {
    arity = [arity];
  }
  return function () {
    var args = Array.prototype.slice.call(arguments), valid, i;
    if (arity) {
      valid = false;
      for (i = 0; !valid && i < arity.length; i++) {
        if (typeof arity[i] === 'number') {
          if (args.length === arity[i]) {
            valid = true;
          }
        } else if (
          Object.prototype.toString.call(arity[i]) === '[object Array]' &&
            args.length >= arity[i][0] && args.length <= arity[i][1]
        ) {
          valid = true;
        }
      }
      if (!valid) {
        throw new AqlError(
          'Invalid number of arguments for function ' +
            functionName + ': ' + args.length
        );
      }
    }
    return new types.FunctionCall(functionName, args);
  };
};

function deprecateAqlFunction(fn, functionName) {
  return function () {
    warn('The AQL function ' + functionName + ' is deprecated!');
    return fn.apply(this, arguments);
  };
}

var builtins = {
  // Conversion
  TO_BOOL: 1, TO_NUMBER: 1, TO_STRING: 1, TO_LIST: 1,
  // Type checks
  IS_NULL: 1, IS_BOOL: 1, IS_NUMBER: 1, IS_STRING: 1, IS_LIST: 1, IS_DOCUMENT: 1,
  // String functions
  CONCAT: [[1, Infinity]], CONCAT_SEPARATOR: [[2, Infinity]],
  CHAR_LENGTH: 1, LENGTH: 1, LOWER: 1, UPPER: 1, SUBSTRING: [2, 3],
  LEFT: 2, RIGHT: 2, TRIM: 2, REVERSE: 1, CONTAINS: 3, LIKE: 3,
  // Numeric functions
  FLOOR: 1, CEIL: 1, ROUND: 1, ABS: 1, SQRT: 1, RAND: 0,
  // Date functions
  DATE_TIMESTAMP: [1, [3, 7]], DATE_ISO8601: [1, [3, 7]],
  DATE_DAYOFWEEK: 1, DATE_YEAR: 1, DATE_MONTH: 1, DATE_DAY: 1,
  DATE_HOUR: 1, DATE_MINUTE: 1, DATE_SECOND: 1, DATE_MILLISECOND: 1,
  DATE_NOW: 0,
  // List functions
  /*LENGTH: 1,*/ FLATTEN: [1, 2], MIN: 1, MAX: 1, AVERAGE: 1, SUM: 1,
  MEDIAN: 1, VARIANCE_POPULATION: 1, VARIANCE_SAMPLE: 1,
  STDDEV_POPULATION: 1, STDDEV_SAMPLE: 1, /*REVERSE: 1,*/
  FIRST: 1, LAST: 1, NTH: 2, POSITION: [2, 3], SLICE: [2, 3],
  UNIQUE: 1, UNION: [[1, Infinity]], UNION_DISTINCT: [[1, Infinity]],
  MINUS: [[1, Infinity]], INTERSECTION: [[1, Infinity]],
  // Document functions
  MATCHES: [2, 3], MERGE: [[1, Infinity]], MERGE_RECURSIVE: [[1, Infinity]],
  TRANSLATE: [2, 3], HAS: 2, ATTRIBUTES: [[1, 3]], UNSET: [[1, Infinity]],
  KEEP: [[2, Infinity]], PARSE_IDENTIFIER: 1,
  // Geo functions
  NEAR: [5, 6], WITHIN: [5, 6],
  // Fulltext functions
  FULLTEXT: 3,
  // Graph functions
  PATHS: [3, 4], TRAVERSAL: [5, 6], TRAVERSAL_TREE: [5, 6],
  SHORTEST_PATH: [5, 6], EDGES: [3, 4], NEIGHBORS: [4, 5],
  // Control flow functions
  NOT_NULL: [[1, Infinity]], FIRST_LIST: [[1, Infinity]],
  FIRST_DOCUMENT: [[1, Infinity]],
  // Miscellaneous functions
  COLLECTIONS: 0, CURRENT_USER: 0, DOCUMENT: [1, 2], SKIPLIST: [[2, 4]]
};
var deprecated = [
  'PATHS',
  'TRAVERSAL',
  'TRAVERSAL_TREE',
  'SHORTEST_PATH',
  'NEIGHBORS'
];
for (var key in builtins) {
  if (builtins.hasOwnProperty(key)) {
    QB[key] = QB.fn(key, builtins[key]);
    if (deprecated.indexOf(key) !== -1) {
      QB[key] = deprecateAqlFunction(QB[key], key);
    }
  }
}

module.exports = QB;