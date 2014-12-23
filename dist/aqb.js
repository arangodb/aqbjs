!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.aqb=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint browserify: true */
'use strict';
exports.keywords = [
  'asc',
  'collect',
  'desc',
  'false',
  'filter',
  'for',
  'in',
  'insert',
  'into',
  'let',
  'limit',
  'null',
  'remove',
  'replace',
  'return',
  'sort',
  'true',
  'update',
  'with'
];

exports.builtins = {
  // Conversion
  TO_BOOL: 1, TO_NUMBER: 1, TO_STRING: 1, TO_LIST: 1,
  // Type checks
  IS_NULL: 1, IS_BOOL: 1, IS_NUMBER: 1, IS_STRING: 1, IS_LIST: 1, IS_DOCUMENT: 1,
  // String functions
  CONCAT: [[1, Infinity]], CONCAT_SEPARATOR: [[2, Infinity]],
  CHAR_LENGTH: 1, LENGTH: 1, LOWER: 1, UPPER: 1, SUBSTRING: [2, 3],
  LEFT: 2, RIGHT: 2, TRIM: [1, 2], REVERSE: 1, CONTAINS: 3, LIKE: 3,
  LTRIM: [1, 2], RTRIM: [1, 2], FIND_FIRST: [2, 3, 4], FIND_LAST: [2, 3, 4],
  SPLIT: [1, 2, 3], SUBSTITUTE: [2, 3, 4],
  // Numeric functions
  FLOOR: 1, CEIL: 1, ROUND: 1, ABS: 1, SQRT: 1, RAND: 0,
  // Date functions
  DATE_TIMESTAMP: [1, [3, 7]], DATE_ISO8601: [1, [3, 7]],
  DATE_DAYOFWEEK: 1, DATE_YEAR: 1, DATE_MONTH: 1, DATE_DAY: 1,
  DATE_HOUR: 1, DATE_MINUTE: 1, DATE_SECOND: 1, DATE_MILLISECOND: 1,
  DATE_NOW: 0,
  // List functions
  /*LENGTH: 1,*/ FLATTEN: [1, 2], MIN: 1, MAX: 1, AVERAGE: 1, SUM: 1,
  MEDIAN: 1, PERCENTILE: [2, 3], VARIANCE_POPULATION: 1, VARIANCE_SAMPLE: 1,
  STDDEV_POPULATION: 1, STDDEV_SAMPLE: 1, /*REVERSE: 1,*/
  FIRST: 1, LAST: 1, NTH: 2, POSITION: [2, 3], SLICE: [2, 3],
  UNIQUE: 1, UNION: [[1, Infinity]], UNION_DISTINCT: [[1, Infinity]],
  MINUS: [[1, Infinity]], INTERSECTION: [[1, Infinity]],
  CALL: [[1, Infinity]], APPLY: [[1, Infinity]],
  PUSH: [2, 3], APPEND: [2, 3], POP: 1, SHIFT: 1, UNSHIFT: [2, 3],
  REMOVE_VALUE: [2, 3], REMOVE_VALUES: 2, REMOVE_NTH: 2,
  // Document functions
  MATCHES: [2, 3], MERGE: [[1, Infinity]], MERGE_RECURSIVE: [[1, Infinity]],
  TRANSLATE: [2, 3], HAS: 2, ATTRIBUTES: [[1, 3]], UNSET: [[1, Infinity]],
  KEEP: [[2, Infinity]], PARSE_IDENTIFIER: 1, ZIP: 2,
  // Geo functions
  NEAR: [5, 6], WITHIN: [5, 6], WITHIN_RECTANGLE: 5, IS_IN_POLYGON: [2, 3],
  // Fulltext functions
  FULLTEXT: 3,
  // Graph functions
  PATHS: [3, 4], TRAVERSAL: [5, 6], TRAVERSAL_TREE: [5, 6],
  SHORTEST_PATH: [5, 6], EDGES: [3, 4], NEIGHBORS: [4, 5],
  GRAPH_PATHS: [1, 2], GRAPH_SHORTEST_PATH: [3, 4], GRAPH_DISTANCE_TO: [3, 4],
  GRAPH_TRAVERSAL: [3, 4], GRAPH_TRAVERSAL_TREE: [4, 5], GRAPH_EDGES: [2, 3],
  GRAPH_VERTICES: [2, 3], GRAPH_NEIGHBORS: [2, 3], GRAPH_COMMON_NEIGHBORS: [3, 4, 5],
  GRAPH_COMMON_PROPERTIES: [3, 4], GRAPH_ECCENTRICITY: [1, 2], 
  GRAPH_BETWEENNESS: [1, 2], GRAPH_CLOSENESS: [1, 2],
  GRAPH_ABSOLUTE_ECCENTRICITY: [2, 3], GRAPH_ABSOLUTE_BETWEENNESS: [2, 3],
  GRAPH_ABSOLUTE_CLOSENESS: [2, 3], GRAPH_DIAMETER: [1, 2], GRAPH_RADIUS: [1, 2],
  // Control flow functions
  NOT_NULL: [[1, Infinity]], FIRST_LIST: [[1, Infinity]],
  FIRST_DOCUMENT: [[1, Infinity]],
  // Miscellaneous functions
  COLLECTIONS: 0, CURRENT_USER: 0, DOCUMENT: [1, 2], SKIPLIST: [[2, 4]]
};

exports.deprecatedBuiltins = [
  'PATHS',
  'TRAVERSAL',
  'TRAVERSAL_TREE',
  'SHORTEST_PATH',
  'NEIGHBORS'
];

},{}],2:[function(require,module,exports){
/*jshint browserify: true */
'use strict';
function AqlError(message) {
  this.message = message;
  var err = new Error(message);
  err.name = this.name;
  if (err.hasOwnProperty('stack')) {this.stack = err.stack;}
  if (err.hasOwnProperty('description')) {this.description = err.description;}
  if (err.hasOwnProperty('lineNumber')) {this.lineNumber = err.lineNumber;}
  if (err.hasOwnProperty('fileName')) {this.fileName = err.fileName;}
}
AqlError.prototype = new Error();
AqlError.prototype.constructor = AqlError;
AqlError.prototype.name = 'AqlError';

exports.AqlError = AqlError;
},{}],3:[function(require,module,exports){
'use strict';
var AqlError = require('./errors').AqlError, assumptions = require('./assumptions'), types = require('./types'), QB = {}, toArray, warn;
toArray = Function.prototype.call.bind(Array.prototype.slice);
warn = function () {
    if (typeof console !== 'undefined') {
        return function () {
            return console.warn.apply(console, arguments);
        };
    }
    try {
        var cons = require('console');
        return function () {
            return cons.warn.apply(cons, arguments);
        };
    } catch (err) {
        return function () {
        };
    }
}();
Object.keys(types._PartialStatement.prototype).forEach(function (key) {
    if (key === 'constructor')
        return;
    QB[key] = types._PartialStatement.prototype[key].bind(null);
});
QB.bool = function (value) {
    return new types.BooleanLiteral(value);
};
QB.num = function (value) {
    return new types.NumberLiteral(value);
};
QB.int_ = QB['int'] = function (value) {
    return new types.IntegerLiteral(value);
};
QB.str = function (value) {
    return new types.StringLiteral(value);
};
QB.list = function (arr) {
    return new types.ListLiteral(arr);
};
QB.obj = function (obj) {
    return new types.ObjectLiteral(obj);
};
QB.range = function (start, end) {
    return new types.RangeExpression(start, end);
};
QB.get = function (obj, key) {
    return new types.PropertyAccess(obj, key);
};
QB.ref = function (value) {
    if (types.Identifier.re.exec(value)) {
        return new types.Identifier(value);
    }
    return new types.SimpleReference(value);
};
QB.expr = function (value) {
    return new types.RawExpression(value);
};
QB.and = function () {
    return new types.NAryOperation('&&', toArray(arguments));
};
QB.or = function () {
    return new types.NAryOperation('||', toArray(arguments));
};
QB.plus = QB.add = function () {
    return new types.NAryOperation('+', toArray(arguments));
};
QB.minus = QB.sub = function () {
    return new types.NAryOperation('-', toArray(arguments));
};
QB.times = QB.mul = function () {
    return new types.NAryOperation('*', toArray(arguments));
};
QB.div = function () {
    return new types.NAryOperation('/', toArray(arguments));
};
QB.mod = function () {
    return new types.NAryOperation('%', toArray(arguments));
};
QB.eq = function (x, y) {
    return new types.BinaryOperation('==', x, y);
};
QB.gt = function (x, y) {
    return new types.BinaryOperation('>', x, y);
};
QB.gte = function (x, y) {
    return new types.BinaryOperation('>=', x, y);
};
QB.lt = function (x, y) {
    return new types.BinaryOperation('<', x, y);
};
QB.lte = function (x, y) {
    return new types.BinaryOperation('<=', x, y);
};
QB.neq = function (x, y) {
    return new types.BinaryOperation('!=', x, y);
};
QB.not = function (x) {
    return new types.UnaryOperation('!', x);
};
QB.neg = function (x) {
    return new types.UnaryOperation('-', x);
};
QB.in_ = QB['in'] = function (x, y) {
    return new types.BinaryOperation('in', x, y);
};
QB.if_ = QB['if'] = function (x, y, z) {
    return new types.TernaryOperation('?', ':', x, y, z);
};
QB.fn = function (functionName, arity) {
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
                } else if (Object.prototype.toString.call(arity[i]) === '[object Array]' && args.length >= arity[i][0] && args.length <= arity[i][1]) {
                    valid = true;
                }
            }
            if (!valid) {
                throw new AqlError('Invalid number of arguments for function ' + functionName + ': ' + args.length);
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
Object.keys(assumptions.builtins).forEach(function (key) {
    QB[key] = QB.fn(key, assumptions.builtins[key]);
    if (assumptions.deprecatedBuiltins.indexOf(key) !== -1) {
        QB[key] = deprecateAqlFunction(QB[key], key);
    }
});
module.exports = QB;
},{"./assumptions":1,"./errors":2,"./types":4,"console":undefined}],4:[function(require,module,exports){
'use strict';
var AqlError = require('./errors').AqlError, keywords = require('./assumptions').keywords;
function wrapAQL(expr) {
    if (expr instanceof Operation || expr instanceof Statement || expr instanceof PartialStatement) {
        return '(' + expr.toAQL() + ')';
    }
    return expr.toAQL();
}
function isValidNumber(token) {
    return typeof token === 'number' && token === token && token !== Infinity && token !== -Infinity;
}
function castNumber(number) {
    if (Math.floor(number) === number) {
        return new IntegerLiteral(number);
    }
    return new NumberLiteral(number);
}
function castString(str) {
    if (str.match(NumberLiteral.re)) {
        return autoCastToken(Number(str));
    }
    if (str.charAt(0) === '"') {
        return new StringLiteral(JSON.parse(str));
    }
    var match = str.match(RangeExpression.re);
    if (match) {
        return new RangeExpression(Number(match[1]), Number(match[2]));
    }
    if (str.match(Identifier.re)) {
        return new Identifier(str);
    }
    return new SimpleReference(str);
}
function castObject(obj) {
    if (obj.constructor && obj.constructor.name === 'ArangoCollection') {
        return new Identifier(obj.name());
    }
    if (Array.isArray(obj)) {
        return new ListLiteral(obj);
    }
    return new ObjectLiteral(obj);
}
function autoCastToken(token) {
    var match;
    if (token === null || token === undefined) {
        return new NullLiteral();
    }
    if (token instanceof Expression || token instanceof PartialStatement) {
        return token;
    }
    if (isValidNumber(token)) {
        return castNumber(token);
    }
    if (typeof token === 'boolean') {
        return new BooleanLiteral(token);
    }
    if (typeof token === 'string') {
        return castString(token);
    }
    if (typeof token === 'object') {
        return castObject(token);
    }
    throw new AqlError('Invalid AQL value: (' + typeof token + ') ' + token);
}
function Expression() {
}
function Operation() {
}
Operation.prototype = new Expression();
Operation.prototype.constructor = Operation;
function RawExpression(value) {
    if (value && value instanceof RawExpression) {
        value = value.value;
    }
    this.value = value;
}
RawExpression.prototype = new Expression();
RawExpression.prototype.constructor = RawExpression;
RawExpression.prototype.toAQL = function () {
    return String(this.value);
};
function NullLiteral(value) {
    if (value && value instanceof NullLiteral) {
        value = value.value;
    }
    if (value !== null && value !== undefined) {
        throw new AqlError('Expected value to be null: ' + value);
    }
    this.value = value;
}
NullLiteral.prototype = new Expression();
NullLiteral.prototype.constructor = NullLiteral;
NullLiteral.prototype.toAQL = function () {
    return 'null';
};
function BooleanLiteral(value) {
    if (value && value instanceof BooleanLiteral) {
        value = value.value;
    }
    this.value = Boolean(value);
}
BooleanLiteral.prototype = new Expression();
BooleanLiteral.prototype.constructor = BooleanLiteral;
BooleanLiteral.prototype.toAQL = function () {
    return String(this.value);
};
function NumberLiteral(value) {
    if (value && (value instanceof NumberLiteral || value instanceof IntegerLiteral)) {
        value = value.value;
    }
    this.value = Number(value);
    if (this.value !== this.value || this.value === Infinity) {
        throw new AqlError('Expected value to be a finite number: ' + value);
    }
}
NumberLiteral.re = /^[-+]?[0-9]+(\.[0-9]+)?$/;
NumberLiteral.prototype = new Expression();
NumberLiteral.prototype.constructor = NumberLiteral;
NumberLiteral.prototype.toAQL = function () {
    return String(this.value);
};
function IntegerLiteral(value) {
    if (value && (value instanceof NumberLiteral || value instanceof IntegerLiteral)) {
        value = value.value;
    }
    this.value = Number(value);
    if (this.value !== this.value || this.value === Infinity || Math.floor(this.value) !== this.value) {
        throw new AqlError('Expected value to be a finite integer: ' + value);
    }
}
IntegerLiteral.prototype = new Expression();
IntegerLiteral.prototype.constructor = IntegerLiteral;
IntegerLiteral.prototype.toAQL = function () {
    return String(this.value);
};
function StringLiteral(value) {
    if (value && value instanceof StringLiteral) {
        value = value.value;
    }
    if (value && typeof value.toAQL === 'function') {
        value = value.toAQL();
    }
    this.value = String(value);
}
StringLiteral.prototype = new Expression();
StringLiteral.prototype.constructor = StringLiteral;
StringLiteral.prototype.toAQL = function () {
    return JSON.stringify(this.value);
};
function ListLiteral(value) {
    if (value && value instanceof ListLiteral) {
        value = value.value;
    }
    if (!value || !Array.isArray(value)) {
        throw new AqlError('Expected value to be an array: ' + value);
    }
    this.value = value.map(autoCastToken);
}
ListLiteral.prototype = new Expression();
ListLiteral.prototype.constructor = ListLiteral;
ListLiteral.prototype.toAQL = function () {
    var value = this.value.map(wrapAQL);
    return '[' + value.join(', ') + ']';
};
function ObjectLiteral(value) {
    if (value && value instanceof ObjectLiteral) {
        value = value.value;
    }
    if (!value || typeof value !== 'object') {
        throw new AqlError('Expected value to be an object: ' + value);
    }
    this.value = {};
    var self = this;
    Object.keys(value).forEach(function (key) {
        self.value[key] = autoCastToken(value[key]);
    });
}
ObjectLiteral.prototype = new Expression();
ObjectLiteral.prototype.constructor = ObjectLiteral;
ObjectLiteral.prototype.toAQL = function () {
    var value = this.value;
    var items = Object.keys(value).map(function (key) {
            if (key.match(Identifier.re) || key === String(Number(key))) {
                return key + ': ' + wrapAQL(value[key]);
            } else {
                return JSON.stringify(key) + ': ' + wrapAQL(value[key]);
            }
        });
    return '{' + items.join(', ') + '}';
};
function RangeExpression(start, end) {
    this.start = autoCastToken(start);
    this.end = autoCastToken(end);
}
RangeExpression.re = /^([0-9]+)\.\.([0-9]+)$/;
RangeExpression.prototype = new Expression();
RangeExpression.prototype.constructor = RangeExpression;
RangeExpression.prototype.toAQL = function () {
    return wrapAQL(this.start) + '..' + wrapAQL(this.end);
};
function PropertyAccess(obj, key) {
    this.obj = autoCastToken(obj);
    this.key = autoCastToken(key);
}
PropertyAccess.prototype = new Expression();
PropertyAccess.prototype.constructor = PropertyAccess;
PropertyAccess.prototype.toAQL = function () {
    return wrapAQL(this.obj) + '[' + wrapAQL(this.key) + ']';
};
function Keyword(value) {
    if (value && value instanceof Keyword) {
        value = value.value;
    }
    if (!value || typeof value !== 'string') {
        throw new AqlError('Expected value to be a string: ' + value);
    }
    if (!value.match(Keyword.re)) {
        throw new AqlError('Not a valid keyword: ' + value);
    }
    this.value = value;
}
Keyword.re = /^[_a-z][_0-9a-z]*$/i;
Keyword.prototype = new Expression();
Keyword.prototype.constructor = Keyword;
Keyword.prototype.toAQL = function () {
    return String(this.value).toUpperCase();
};
function Identifier(value) {
    if (value && value instanceof Identifier) {
        value = value.value;
    }
    if (!value || typeof value !== 'string') {
        throw new AqlError('Expected value to be a string: ' + value);
    }
    if (!value.match(Identifier.re)) {
        throw new AqlError('Not a valid identifier: ' + value);
    }
    this.value = value;
}
Identifier.re = /^[_a-z][-_0-9a-z]*$/i;
Identifier.prototype = new Expression();
Identifier.prototype.constructor = Identifier;
Identifier.prototype.toAQL = function () {
    var value = String(this.value);
    if (keywords.indexOf(value.toLowerCase()) === -1) {
        return value;
    }
    return '`' + value + '`';
};
function SimpleReference(value) {
    if (value && value instanceof SimpleReference) {
        value = value.value;
    }
    if (!value || typeof value !== 'string') {
        throw new AqlError('Expected value to be a string: ' + value);
    }
    if (!value.match(SimpleReference.re)) {
        throw new AqlError('Not a valid simple reference: ' + value);
    }
    this.value = value;
}
SimpleReference.re = /^@{0,2}[_a-z][_0-9a-z]*(\.[_a-z][_0-9a-z]*|\[\*\])*$/i;
SimpleReference.prototype = new Expression();
SimpleReference.prototype.constructor = SimpleReference;
SimpleReference.prototype.toAQL = function () {
    var value = String(this.value);
    var tokens = value.split('.').map(function (token) {
            return keywords.indexOf(token) === -1 ? token : '`' + token + '`';
        });
    return tokens.join('.');
};
function UnaryOperation(operator, value) {
    if (!operator || typeof operator !== 'string') {
        throw new AqlError('Expected operator to be a string: ' + operator);
    }
    this.operator = operator;
    this.value = autoCastToken(value);
}
UnaryOperation.prototype = new Expression();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.prototype.toAQL = function () {
    return this.operator + wrapAQL(this.value);
};
function BinaryOperation(operator, value1, value2) {
    if (!operator || typeof operator !== 'string') {
        throw new AqlError('Expected operator to be a string: ' + operator);
    }
    this.operator = operator;
    this.value1 = autoCastToken(value1);
    this.value2 = autoCastToken(value2);
}
BinaryOperation.prototype = new Operation();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.prototype.toAQL = function () {
    return [
        wrapAQL(this.value1),
        this.operator,
        wrapAQL(this.value2)
    ].join(' ');
};
function TernaryOperation(operator1, operator2, value1, value2, value3) {
    if (!operator1 || typeof operator1 !== 'string') {
        throw new AqlError('Expected operator 1 to be a string: ' + operator1);
    }
    if (!operator2 || typeof operator2 !== 'string') {
        throw new AqlError('Expected operator 2 to be a string: ' + operator2);
    }
    this.operator1 = operator1;
    this.operator2 = operator2;
    this.value1 = autoCastToken(value1);
    this.value2 = autoCastToken(value2);
    this.value3 = autoCastToken(value3);
}
TernaryOperation.prototype = new Operation();
TernaryOperation.prototype.constructor = TernaryOperation;
TernaryOperation.prototype.toAQL = function () {
    return [
        wrapAQL(this.value1),
        this.operator1,
        wrapAQL(this.value2),
        this.operator2,
        wrapAQL(this.value3)
    ].join(' ');
};
function NAryOperation(operator, values) {
    if (!operator || typeof operator !== 'string') {
        throw new AqlError('Expected operator to be a string: ' + operator);
    }
    this.operator = operator;
    this.values = values.map(autoCastToken);
}
NAryOperation.prototype = new Operation();
NAryOperation.prototype.constructor = NAryOperation;
NAryOperation.prototype.toAQL = function () {
    var values = this.values.map(wrapAQL);
    return values.join(' ' + this.operator + ' ');
};
function FunctionCall(functionName, args) {
    if (!functionName || typeof functionName !== 'string') {
        throw new AqlError('Expected function name to be a string: ' + functionName);
    }
    if (!functionName.match(FunctionCall.re)) {
        throw new AqlError('Not a valid function name: ' + functionName);
    }
    if (args && !Array.isArray(args)) {
        throw new AqlError('Expected arguments to be an array: ' + args);
    }
    this.functionName = functionName;
    this.args = args ? args.map(autoCastToken) : [];
}
FunctionCall.re = /^[_a-z][_0-9a-z]*(::[_a-z][_0-9a-z]*)*$/i;
FunctionCall.prototype = new Expression();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.prototype.toAQL = function () {
    var args = this.args.map(wrapAQL);
    return this.functionName + '(' + args.join(', ') + ')';
};
function PartialStatement() {
}
PartialStatement.prototype['for'] = function (varname) {
    var self = this, inFn;
    inFn = function (expr) {
        return new ForExpression(self, varname, expr);
    };
    return {
        'in': inFn,
        in_: inFn
    };
};
PartialStatement.prototype.filter = function (expr) {
    return new FilterExpression(this, expr);
};
PartialStatement.prototype.let = function (varname, expr) {
    if (expr === undefined) {
        return new LetExpression(this, varname);
    }
    return new LetExpression(this, [[
            varname,
            expr
        ]]);
};
PartialStatement.prototype.collect = function (varname, expr) {
    if (expr === undefined) {
        return new CollectExpression(this, varname);
    }
    return new CollectExpression(this, [[
            varname,
            expr
        ]]);
};
PartialStatement.prototype.sort = function () {
    var args = Array.prototype.slice.call(arguments);
    return new SortExpression(this, args);
};
PartialStatement.prototype.limit = function (x, y) {
    return new LimitExpression(this, x, y);
};
PartialStatement.prototype['return'] = function (x) {
    return new ReturnExpression(this, x);
};
PartialStatement.prototype.remove = function (expr) {
    var self = this, inFn;
    inFn = function (collection) {
        return new RemoveExpression(self, expr, collection);
    };
    return {
        into: inFn,
        'in': inFn,
        in_: inFn
    };
};
PartialStatement.prototype.insert = function (expr) {
    var self = this, inFn;
    inFn = function (collection) {
        return new InsertExpression(self, expr, collection);
    };
    return {
        into: inFn,
        'in': inFn,
        in_: inFn
    };
};
PartialStatement.prototype.update = function (expr) {
    var self = this, withFn, inFn;
    withFn = function (withExpr) {
        var inFn = function (collection) {
            return new UpdateExpression(self, expr, withExpr, collection);
        };
        return {
            into: inFn,
            'in': inFn,
            in_: inFn
        };
    };
    inFn = function (collection) {
        return new ReplaceExpression(self, expr, undefined, collection);
    };
    return {
        'with': withFn,
        with_: withFn,
        into: inFn,
        'in': inFn,
        in_: inFn
    };
};
PartialStatement.prototype.replace = function (expr) {
    var self = this, withFn, inFn;
    withFn = function (withExpr) {
        var inFn = function (collection) {
            return new ReplaceExpression(self, expr, withExpr, collection);
        };
        return {
            into: inFn,
            'in': inFn,
            in_: inFn
        };
    };
    inFn = function (collection) {
        return new ReplaceExpression(self, expr, undefined, collection);
    };
    return {
        'with': withFn,
        with_: withFn,
        into: inFn,
        'in': inFn,
        in_: inFn
    };
};
PartialStatement.prototype.for_ = PartialStatement.prototype['for'];
PartialStatement.prototype.let_ = PartialStatement.prototype.let;
PartialStatement.prototype.return_ = PartialStatement.prototype['return'];
function Definitions(dfns) {
    if (dfns instanceof Definitions) {
        dfns = dfns.dfns;
    }
    this.dfns = [];
    var self = this;
    if (!dfns || typeof dfns !== 'object') {
        throw new AqlError('Expected definitions to be an object');
    }
    if (Array.isArray(dfns)) {
        dfns.forEach(function (dfn, i) {
            if (!Array.isArray(dfn) || dfn.length !== 2) {
                throw new AqlError('Expected definitions[' + i + '] to be a tuple');
            }
            self.dfns.push([
                new Identifier(dfn[0]),
                autoCastToken(dfn[1])
            ]);
        });
    } else {
        Object.keys(dfns).forEach(function (key) {
            self.dfns.push([
                new Identifier(key),
                autoCastToken(dfns[key])
            ]);
        });
    }
    if (this.dfns.length === 0) {
        throw new AqlError('Expected definitions not to be empty');
    }
}
Definitions.prototype.toAQL = function () {
    return this.dfns.map(function (dfn) {
        return dfn[0].toAQL() + ' = ' + wrapAQL(dfn[1]);
    }).join(', ');
};
function ForExpression(prev, varname, expr) {
    this.prev = prev;
    this.varname = new Identifier(varname);
    this.expr = autoCastToken(expr);
}
ForExpression.prototype = new PartialStatement();
ForExpression.prototype.constructor = ForExpression;
ForExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'FOR ' + wrapAQL(this.varname) + ' IN ' + wrapAQL(this.expr);
};
function FilterExpression(prev, expr) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
}
FilterExpression.prototype = new PartialStatement();
FilterExpression.prototype.constructor = FilterExpression;
FilterExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'FILTER ' + wrapAQL(this.expr);
};
function LetExpression(prev, dfns) {
    this.prev = prev;
    this.dfns = new Definitions(dfns);
}
LetExpression.prototype = new PartialStatement();
LetExpression.prototype.constructor = LetExpression;
LetExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'LET ' + this.dfns.toAQL();
};
function CollectExpression(prev, dfns) {
    this.prev = prev;
    this.dfns = new Definitions(dfns);
}
CollectExpression.prototype = new PartialStatement();
CollectExpression.prototype.constructor = CollectExpression;
CollectExpression.prototype.into = function (varname) {
    return new CollectIntoExpression(this.prev, this.dfns, varname);
};
CollectExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'COLLECT ' + this.dfns.toAQL();
};
function CollectIntoExpression(prev, dfns, varname) {
    this.prev = prev;
    this.dfns = new Definitions(dfns);
    this.varname = new Identifier(varname);
}
CollectIntoExpression.prototype = new PartialStatement();
CollectIntoExpression.prototype.constructor = CollectIntoExpression;
CollectIntoExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'COLLECT ' + this.dfns.toAQL() + ' INTO ' + this.varname.toAQL();
};
function SortExpression(prev, args) {
    if (!args || !Array.isArray(args)) {
        throw new AqlError('Expected sort list to be an array: ' + args);
    }
    if (!args.length) {
        throw new AqlError('Expected sort list not to be empty: ' + args);
    }
    this.prev = prev;
    this.args = [];
    var allowKeyword = false;
    this.args = args.map(function (arg, i) {
        if (!allowKeyword && arg) {
            if (arg instanceof Keyword || typeof arg === 'string' && SortExpression.keywords.indexOf(arg.toUpperCase()) !== -1) {
                throw new AqlError('Unexpected keyword ' + arg.toString() + ' at offset ' + i);
            }
        }
        if (typeof arg === 'string' && SortExpression.keywords.indexOf(arg.toUpperCase()) !== -1) {
            allowKeyword = false;
            return new Keyword(arg);
        } else {
            allowKeyword = true;
            return autoCastToken(arg);
        }
    });
}
SortExpression.keywords = [
    'ASC',
    'DESC'
];
SortExpression.prototype = new PartialStatement();
SortExpression.prototype.constructor = SortExpression;
SortExpression.prototype.toAQL = function () {
    var args = [], j = 0;
    this.args.forEach(function (arg, i) {
        if (arg instanceof Keyword) {
            args[j] += ' ' + arg.toAQL();
        } else {
            j = args.push(wrapAQL(arg)) - 1;
        }
    });
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'SORT ' + args.join(', ');
};
function LimitExpression(prev, offset, count) {
    if (count === undefined) {
        count = offset;
        offset = undefined;
    }
    this.prev = prev;
    this.offset = offset === undefined ? undefined : autoCastToken(offset);
    this.count = autoCastToken(count);
}
LimitExpression.prototype = new PartialStatement();
LimitExpression.prototype.constructor = LimitExpression;
LimitExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'LIMIT ' + (this.offset === undefined ? wrapAQL(this.count) : wrapAQL(this.offset) + ', ' + wrapAQL(this.count));
};
function Statement() {
}
Statement.prototype = new Expression();
Statement.prototype.constructor = Statement;
function ReturnExpression(prev, value) {
    this.prev = prev;
    this.value = autoCastToken(value);
}
ReturnExpression.prototype = new Statement();
ReturnExpression.prototype.constructor = ReturnExpression;
ReturnExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'RETURN ' + wrapAQL(this.value);
};
function RemoveExpression(prev, expr, collection) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.collection = new Identifier(collection);
}
RemoveExpression.prototype = new Statement();
RemoveExpression.prototype.constructor = RemoveExpression;
RemoveExpression.prototype.options = function (opts) {
    return new RemoveExpressionWithOptions(this.prev, this.expr, this.collection, opts);
};
RemoveExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'REMOVE ' + wrapAQL(this.expr) + ' IN ' + wrapAQL(this.collection);
};
function RemoveExpressionWithOptions(prev, expr, collection, opts) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.collection = new Identifier(collection);
    this.opts = autoCastToken(opts);
}
RemoveExpressionWithOptions.prototype = new Statement();
RemoveExpressionWithOptions.prototype.constructor = RemoveExpressionWithOptions;
RemoveExpressionWithOptions.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'REMOVE ' + wrapAQL(this.expr) + ' IN ' + wrapAQL(this.collection) + ' OPTIONS ' + wrapAQL(this.opts);
};
function InsertExpression(prev, expr, collection) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.collection = new Identifier(collection);
}
InsertExpression.prototype = new Statement();
InsertExpression.prototype.constructor = InsertExpression;
InsertExpression.prototype.options = function (opts) {
    return new InsertExpressionWithOptions(this.prev, this.expr, this.collection, opts);
};
InsertExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'INSERT ' + wrapAQL(this.expr) + ' INTO ' + wrapAQL(this.collection);
};
function InsertExpressionWithOptions(prev, expr, collection, opts) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.collection = new Identifier(collection);
    this.opts = autoCastToken(opts);
}
InsertExpressionWithOptions.prototype = new Statement();
InsertExpressionWithOptions.prototype.constructor = InsertExpressionWithOptions;
InsertExpressionWithOptions.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'INSERT ' + wrapAQL(this.expr) + ' INTO ' + wrapAQL(this.collection) + ' OPTIONS ' + wrapAQL(this.opts);
};
function UpdateExpression(prev, expr, withExpr, collection) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.withExpr = withExpr === undefined ? undefined : autoCastToken(withExpr);
    this.collection = new Identifier(collection);
}
UpdateExpression.prototype = new Statement();
UpdateExpression.prototype.constructor = UpdateExpression;
UpdateExpression.prototype.options = function (opts) {
    return new UpdateExpressionWithOptions(this.prev, this.expr, this.withExpr, this.collection, opts);
};
UpdateExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'UPDATE ' + wrapAQL(this.expr) + (this.withExpr ? ' WITH ' + wrapAQL(this.withExpr) : '') + ' IN ' + wrapAQL(this.collection);
};
function UpdateExpressionWithOptions(prev, expr, withExpr, collection, opts) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.withExpr = withExpr === undefined ? undefined : autoCastToken(withExpr);
    this.collection = new Identifier(collection);
    this.opts = autoCastToken(opts);
}
UpdateExpressionWithOptions.prototype = new Statement();
UpdateExpressionWithOptions.prototype.constructor = UpdateExpressionWithOptions;
UpdateExpressionWithOptions.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'UPDATE ' + wrapAQL(this.expr) + (this.withExpr ? ' WITH ' + wrapAQL(this.withExpr) : '') + ' IN ' + wrapAQL(this.collection) + ' OPTIONS ' + wrapAQL(this.opts);
};
function ReplaceExpression(prev, expr, withExpr, collection) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.withExpr = withExpr === undefined ? undefined : autoCastToken(withExpr);
    this.collection = new Identifier(collection);
}
ReplaceExpression.prototype = new Statement();
ReplaceExpression.prototype.constructor = ReplaceExpression;
ReplaceExpression.prototype.options = function (opts) {
    return new ReplaceExpressionWithOptions(this.prev, this.expr, this.withExpr, this.collection, opts);
};
ReplaceExpression.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'REPLACE ' + wrapAQL(this.expr) + (this.withExpr ? ' WITH ' + wrapAQL(this.withExpr) : '') + ' IN ' + wrapAQL(this.collection);
};
function ReplaceExpressionWithOptions(prev, expr, withExpr, collection, opts) {
    this.prev = prev;
    this.expr = autoCastToken(expr);
    this.withExpr = withExpr === undefined ? undefined : autoCastToken(withExpr);
    this.collection = new Identifier(collection);
    this.opts = autoCastToken(opts);
}
ReplaceExpressionWithOptions.prototype = new Statement();
ReplaceExpressionWithOptions.prototype.constructor = ReplaceExpressionWithOptions;
ReplaceExpressionWithOptions.prototype.toAQL = function () {
    return (this.prev ? this.prev.toAQL() + ' ' : '') + 'REPLACE ' + wrapAQL(this.expr) + (this.withExpr ? ' WITH ' + wrapAQL(this.withExpr) : '') + ' IN ' + wrapAQL(this.collection) + ' OPTIONS ' + wrapAQL(this.opts);
};
exports.autoCastToken = autoCastToken;
exports.RawExpression = RawExpression;
exports.NullLiteral = NullLiteral;
exports.BooleanLiteral = BooleanLiteral;
exports.NumberLiteral = NumberLiteral;
exports.IntegerLiteral = IntegerLiteral;
exports.StringLiteral = StringLiteral;
exports.ListLiteral = ListLiteral;
exports.ObjectLiteral = ObjectLiteral;
exports.RangeExpression = RangeExpression;
exports.PropertyAccess = PropertyAccess;
exports.Keyword = Keyword;
exports.Identifier = Identifier;
exports.SimpleReference = SimpleReference;
exports.UnaryOperation = UnaryOperation;
exports.BinaryOperation = BinaryOperation;
exports.TernaryOperation = TernaryOperation;
exports.NAryOperation = NAryOperation;
exports.FunctionCall = FunctionCall;
exports.ForExpression = ForExpression;
exports.FilterExpression = FilterExpression;
exports.LetExpression = LetExpression;
exports.CollectExpression = CollectExpression;
exports.SortExpression = SortExpression;
exports.LimitExpression = LimitExpression;
exports.ReturnExpression = ReturnExpression;
exports.RemoveExpression = RemoveExpression;
exports.InsertExpression = InsertExpression;
exports.UpdateExpression = UpdateExpression;
exports.ReplaceExpression = ReplaceExpression;
exports._Expression = Expression;
exports._Operation = Operation;
exports._Statement = Statement;
exports._PartialStatement = PartialStatement;
exports._Definitions = Definitions;
exports._CollectIntoExpression = CollectIntoExpression;
exports._RemoveExpressionWithOptions = RemoveExpressionWithOptions;
exports._InsertExpressionWithOptions = InsertExpressionWithOptions;
exports._UpdateExpressionWithOptions = UpdateExpressionWithOptions;
exports._ReplaceExpressionWithOptions = ReplaceExpressionWithOptions;
},{"./assumptions":1,"./errors":2}]},{},[3])(3)
});