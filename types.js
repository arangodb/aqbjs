/* jshint globalstrict: true, es3: true */
/* globals require: false, exports: false */
'use strict';
var AqlError = require('./errors').AqlError,
  keywords = require('./assumptions').keywords;

function wrapAQL(expr) {
  if (expr instanceof Statement) {
    return '(' + expr.toAQL() + ')';
  }
  return expr.toAQL();
}

function autoCastToken(token) {
  var match;
  if (token === null || token === undefined) {
    return new NullLiteral();
  }
  if (token instanceof Expression) {
    return token;
  }
  if (typeof token === 'number') {
    if (Math.floor(token) === token) {
      return new IntegerLiteral(token);
    }
    return new NumberLiteral(token);
  }
  if (typeof token === 'boolean') {
    return new BooleanLiteral(token);
  }
  if (typeof token === 'string') {
    if (token.charAt(0) === '"') {
      return new StringLiteral(JSON.parse(token));
    }
    match = token.match(/^([0-9]+)\.\.([0-9]+)$/);
    if (match) {
      return new RangeExpression(match[1], match[2]);
    }
    if (token.match(Identifier.re)) {
      return new Identifier(token);
    }
    return new SimpleReference(token);
  }
  if (typeof token === 'object') {
    if (Object.prototype.toString.call(token) === '[object Array]') {
      return new ListLiteral(token);
    }
    return new ObjectLiteral(token);
  }
  throw new AqlError('Invalid type for an AQL value: ' + (typeof token));
}

function fromAqlWithType(type) {
  return function () {
    return '(' + type + ') ' + this.toAQL();
  };
}

function Expression() {}
function Operation() {}
Operation.prototype = new Expression();
Operation.prototype.constructor = Operation;

function RawExpression(value) {
  this.value = value;
}
RawExpression.prototype = new Expression();
RawExpression.prototype.constructor = RawExpression;
RawExpression.prototype.toAQL = function () {return String(this.value);};
RawExpression.prototype.toString = fromAqlWithType('raw');

function NullLiteral(value) {
  if (value && value instanceof NullLiteral) {value = value.value;}
  if (value !== null && value !== undefined) {
    throw new AqlError('Expected value to be null: ' + value);
  }
  this.value = value;
}
NullLiteral.prototype = new Expression();
NullLiteral.prototype.constructor = NullLiteral;
NullLiteral.prototype.toAQL = function () {return 'null';};
NullLiteral.prototype.toString = fromAqlWithType('nil');

function BooleanLiteral(value) {
  if (value && value instanceof BooleanLiteral) {value = value.value;}
  this.value = Boolean(value);
}
BooleanLiteral.prototype = new Expression();
BooleanLiteral.prototype.constructor = BooleanLiteral;
BooleanLiteral.prototype.toAQL = function () {return String(this.value);};
BooleanLiteral.prototype.toString = fromAqlWithType('bool');

function NumberLiteral(value) {
  if (value && (
    value instanceof NumberLiteral ||
    value instanceof IntegerLiteral
  )) {value = value.value;}
  this.value = Number(value);
  if (this.value !== this.value) {
    throw new AqlError('Expected value to be a number: ' + value);
  }
}
NumberLiteral.prototype = new Expression();
NumberLiteral.prototype.constructor = NumberLiteral;
NumberLiteral.prototype.toAQL = function () {return String(this.value);};
NumberLiteral.prototype.toString = fromAqlWithType('num');

function IntegerLiteral(value) {
  if (value && value instanceof IntegerLiteral) {value = value.value;}
  this.value = Number(value);
  if (this.value !== this.value || Math.floor(this.value) !== this.value) {
    throw new AqlError('Expected value to be an integer: ' + value);
  }
}
IntegerLiteral.prototype = new Expression();
IntegerLiteral.prototype.constructor = IntegerLiteral;
IntegerLiteral.prototype.toAQL = function () {return String(this.value);};
IntegerLiteral.prototype.toString = fromAqlWithType('int');

function StringLiteral(value) {
  if (value && value instanceof StringLiteral) {value = value.value;}
  this.value = String(value);
}
StringLiteral.prototype = new Expression();
StringLiteral.prototype.constructor = StringLiteral;
StringLiteral.prototype.toAQL = function () {return JSON.stringify(this.value);};
StringLiteral.prototype.toString = fromAqlWithType('str');

function ListLiteral(value) {
  if (value && value instanceof ListLiteral) {value = value.value;}
  if (!value || Object.prototype.toString.call(value) !== '[object Array]') {
    throw new AqlError('Expected value to be an array: ' + value);
  }
  this.value = [];
  for (var i = 0; i < value.length; i++) {
    this.value[i] = autoCastToken(value[i]);
  }
}
ListLiteral.prototype = new Expression();
ListLiteral.prototype.constructor = ListLiteral;
ListLiteral.prototype.toAQL = function () {
  var value = [], i;
  for (i = 0; i < this.value.length; i++) {
    value.push(wrapAQL(this.value[i]));
  }
  return '[' + value.join(', ') + ']';
};
ListLiteral.prototype.toString = function () {
  var value = [], i;
  for (i = 0; i < this.value.length; i++) {
    value.push(this.value[i].toString());
  }
  return '[' + value.join(', ') + ']';
};

function ObjectLiteral(value) {
  if (value && value instanceof ObjectLiteral) {value = value.value;}
  if (!value || typeof value !== 'object') {
    throw new AqlError('Expected value to be an object: ' + value);
  }
  this.value = {};
  for (var key in value) {
    if (value.hasOwnProperty(key)) {
      this.value[key] = autoCastToken(value[key]);
    }
  }
}
ObjectLiteral.prototype = new Expression();
ObjectLiteral.prototype.constructor = ObjectLiteral;
ObjectLiteral.prototype.toAQL = function () {
  var value = [], key;
  for (key in this.value) {
    if (this.value.hasOwnProperty(key)) {
      value.push(JSON.stringify(key) + ': ' + wrapAQL(this.value[key]));
    }
  }
  return '{' + value.join(', ') + '}';
};
ObjectLiteral.prototype.toString = function () {
  var value = [], key;
  for (key in this.value) {
    if (this.value.hasOwnProperty(key)) {
      if (!Identifier.re.exec(key)) {
        key = JSON.stringify(key);
      }
      value.push(key + ': ' + this.value[key].toString());
    }
  }
  return '{' + value.join(', ') + '}';
};

function RangeExpression(start, end) {
  this.start = new IntegerLiteral(start);
  this.end = new IntegerLiteral(end);
}
RangeExpression.prototype = new Expression();
RangeExpression.prototype.constructor = RangeExpression;
RangeExpression.prototype.toAQL = function () {
  return wrapAQL(this.start) + '..' + wrapAQL(this.end);
};
RangeExpression.prototype.toString = function () {
  return this.start.toString() + '..' + this.end.toString();
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
PropertyAccess.prototype.toString = function () {
  return this.obj.toString() + '[' + this.key.toString() + ']';
};

function Keyword(value) {
  if (value && value instanceof Keyword) {value = value.value;}
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
Keyword.prototype.toString = fromAqlWithType('keyword');

function Identifier(value) {
  if (value && value instanceof Identifier) {value = value.value;}
  if (!value || typeof value !== 'string') {
    throw new AqlError('Expected value to be a string: ' + value);
  }
  if (!value.match(Identifier.re)) {
    throw new AqlError('Not a valid identifier: ' + value);
  }
  this.value = value;
}
Identifier.re = /^[_a-z][_0-9a-z]*$/i;
Identifier.prototype = new Expression();
Identifier.prototype.constructor = Identifier;
Identifier.prototype.toAQL = function () {
  var value = String(this.value);
  if (keywords.indexOf(value.toLowerCase()) === -1) {
    return value;
  }
  return '`' + value + '`';
};
Identifier.prototype.toString = fromAqlWithType('id');

function SimpleReference(value) {
  if (value && value instanceof SimpleReference) {value = value.value;}
  if (!value || typeof value !== 'string') {
    throw new AqlError('Expected value to be a string: ' + value);
  }
  if (!value.match(SimpleReference.re)) {
    throw new AqlError('Not a valid simple reference: ' + value);
  }
  this.value = value;
}
SimpleReference.re = /^[_a-z][_0-9a-z]*(\.[_a-z][_0-9a-z]*|\[\*\])*$/i;
SimpleReference.prototype = new Expression();
SimpleReference.prototype.constructor = SimpleReference;
SimpleReference.prototype.toAQL = function () {
  var value = String(this.value),
    tokens = value.split('.'),
    i;
  for (i = 0; i < tokens.length; i++) {
    if (keywords.indexOf(tokens[i]) !== -1) {
      tokens[i] = '`' + tokens[i] + '`';
    }
  }
  return tokens.join('.');
};
SimpleReference.prototype.toString = fromAqlWithType('ref');

function UnaryOperation(operator, value) {
  this.operator = operator;
  this.value = autoCastToken(value);
}
UnaryOperation.prototype = new Operation();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.prototype.toAQL = function () {
  if (this.value instanceof Operation) {
    return this.operator + '(' + wrapAQL(this.value) + ')';
  }
  return this.operator + wrapAQL(this.value);
};
UnaryOperation.prototype.toString = function () {
  if (this.value instanceof Operation) {
    return this.operator + '(' + this.value.toString() + ')';
  }
  return this.operator + wrapAQL(this.value);
};

function BinaryOperation(operator, a, b) {
  this.operator = operator;
  this.a = autoCastToken(a);
  this.b = autoCastToken(b);
}
BinaryOperation.prototype = new Operation();
BinaryOperation.prototype.constructor = BinaryOperation;
BinaryOperation.prototype.toAQL = function () {
  return [
    this.a instanceof Operation ? '(' + wrapAQL(this.a) + ')' : wrapAQL(this.a),
    this.operator,
    this.b instanceof Operation ? '(' + wrapAQL(this.b) + ')' : wrapAQL(this.b)
  ].join(' ');
};
BinaryOperation.prototype.toString = function () {
  return [
    this.a instanceof Operation ? '(' + this.a.toString() + ')' : this.a.toString(),
    this.operator,
    this.b instanceof Operation ? '(' + this.b.toString() + ')' : this.b.toString()
  ].join(' ');
};

function TernaryOperation(operator1, operator2, a, b, c) {
  this.operator1 = operator1;
  this.operator2 = operator2;
  this.a = autoCastToken(a);
  this.b = autoCastToken(b);
  this.c = autoCastToken(c);
}
TernaryOperation.prototype = new Operation();
TernaryOperation.prototype.constructor = TernaryOperation;
TernaryOperation.prototype.toAQL = function () {
  return [
    this.a instanceof Operation ? '(' + wrapAQL(this.a) + ')' : wrapAQL(this.a),
    this.operator1,
    this.b instanceof Operation ? '(' + wrapAQL(this.b) + ')' : wrapAQL(this.b),
    this.operator2,
    this.c instanceof Operation ? '(' + wrapAQL(this.c) + ')' : wrapAQL(this.c)
  ].join(' ');
};
TernaryOperation.prototype.toString = function () {
  return [
    this.a instanceof Operation ? '(' + this.a.toString() + ')' : this.a.toString(),
    this.operator1,
    this.b instanceof Operation ? '(' + this.b.toString() + ')' : this.b.toString(),
    this.operator2,
    this.c instanceof Operation ? '(' + this.c.toString() + ')' : this.c.toString()
  ].join(' ');
};

function FunctionCall(functionName, args) {
  this.functionName = functionName;
  this.args = [];
  for (var i = 0; i < args.length; i++) {
    this.args[i] = autoCastToken(args[i]);
  }
}
FunctionCall.prototype = new Operation();
FunctionCall.prototype.constructor = FunctionCall;
FunctionCall.prototype.toAQL = function () {
  var args = [], i;
  for (i = 0; i < this.args.length; i++) {
    args.push(wrapAQL(this.args[i]));
  }
  return this.functionName + '(' + args.join(', ') + ')';
};
FunctionCall.prototype.toString = function () {
  var args = [], i;
  for (i = 0; i < this.args.length; i++) {
    args.push(this.args[i].toString());
  }
  return this.functionName + '(' + args.join(', ') + ')';
};

function PartialStatement() {}
PartialStatement.prototype.for_ = function (varname) {
  var self = this, inFn;
  inFn = function (expr) {
    // assert expr is an expression
    return new ForExpression(self, varname, expr);
  };
  return {'in': inFn, in_: inFn};
};
PartialStatement.prototype.filter = function (expr) {return new FilterExpression(this, expr);};
PartialStatement.prototype.let_ = function (varname, expr) {return new LetExpression(this, varname, expr);};
PartialStatement.prototype.collect = function (dfns) {
    return new CollectExpression(this, dfns);
};
PartialStatement.prototype.sort = function () {
  var args = Array.prototype.slice.call(arguments);
  return new SortExpression(this, args);
};
PartialStatement.prototype.limit = function (x, y) {return new LimitExpression(x, y);};
PartialStatement.prototype.return_ = function (x) {return new ReturnExpression(this, x);};
PartialStatement.prototype.remove = function (expr) {
  var self = this, inFn;
  inFn = function (collection, opts) {
    return new RemoveExpression(self, expr, collection, opts);
  };
  return {into: inFn, 'in': inFn, in_: inFn};
};
PartialStatement.prototype.insert = function (expr) {
  var self = this, inFn;
  inFn = function (collection, opts) {
    return new InsertExpression(self, expr, collection, opts);
  };
  return {into: inFn, 'in': inFn, in_: inFn};
};
PartialStatement.prototype.update = function (expr) {
  var self = this, withFn;
  withFn = function (withExpr) {
    var inFn = function (collection, opts) {
      return new UpdateExpression(self, expr, withExpr, collection, opts);
    };
    return {into: inFn, 'in': inFn, in_: inFn};
  };
  return {'with': withFn, with_: withFn};
};
PartialStatement.prototype.replace = function (expr) {
  var self = this, withFn;
  withFn = function (withExpr) {
    var inFn = function (collection, opts) {
      return new ReplaceExpression(self, expr, withExpr, collection, opts);
    };
    return {into: inFn, 'in': inFn, in_: inFn};
  };
  return {'with': withFn, with_: withFn};
};

PartialStatement.prototype['for'] = PartialStatement.prototype.for_;
PartialStatement.prototype['let'] = PartialStatement.prototype.let_;
PartialStatement.prototype['return'] = PartialStatement.prototype.return_;

function ForExpression(prev, varname, expr) {
  this.prev = prev;
  this.varname = new Identifier(varname);
  this.expr = autoCastToken(expr);
}
ForExpression.prototype = new PartialStatement();
ForExpression.prototype.constructor = ForExpression;
ForExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  return prefix + 'FOR ' + wrapAQL(this.varname) + ' IN ' + wrapAQL(this.expr);
};

function FilterExpression(prev, expr) {
  this.prev = prev;
  this.expr = autoCastToken(expr);
}
FilterExpression.prototype = new PartialStatement();
FilterExpression.prototype.constructor = FilterExpression;
FilterExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  return prefix + 'FILTER ' + wrapAQL(this.expr);
};

function LetExpression(prev, dfns) {
  this.prev = prev;
  this.dfns = new ObjectLiteral(dfns);
  for (var key in dfns) {
    if (dfns.hasOwnProperty(key) && !Identifier.re.exec(key)) {
      throw new AqlError('Expected key to be a valid identifier: ' + key);
    }
  }
}
LetExpression.prototype = new PartialStatement();
LetExpression.prototype.constructor = LetExpression;
LetExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var dfns = [];
  for (var key in this.dfns) {
    if (this.dfns.hasOwnProperty(key)) {
      dfns.push(key + ' = ' + wrapAQL(this.dfns[key]));
    }
  }
  return prefix + 'LET ' + dfns.join(', ');
};

function CollectExpression(prev, dfns) {
  this.prev = prev;
  this.dfns = new ObjectLiteral(dfns);
  for (var key in dfns) {
    if (dfns.hasOwnProperty(key) && !Identifier.re.exec(key)) {
      throw new AqlError('Expected key to be a valid identifier: ' + key);
    }
  }
}
CollectExpression.prototype = new PartialStatement();
CollectExpression.prototype.constructor = CollectExpression;
CollectExpression.prototype.into = function (varname) {
  return new CollectIntoExpression(this.prev, this.dfns, varname);
};
CollectExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var dfns = [];
  for (var key in this.dfns) {
    if (this.dfns.hasOwnProperty(key)) {
      dfns.push(key + ' = ' + wrapAQL(this.dfns[key]));
    }
  }
  return prefix + 'COLLECT ' + dfns.join(', ');
};

function CollectIntoExpression(prev, dfns, varname) {
  this.prev = prev;
  this.dfns = new ObjectLiteral(dfns);
  for (var key in dfns) {
    if (dfns.hasOwnProperty(key) && !Identifier.re.exec(key)) {
      throw new AqlError('Expected key to be a valid identifier: ' + key);
    }
  }
  this.varname = new Identifier(varname);
}
CollectIntoExpression.prototype = new PartialStatement();
CollectIntoExpression.prototype.constructor = CollectIntoExpression;
CollectIntoExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var dfns = [];
  for (var key in this.dfns) {
    if (this.dfns.hasOwnProperty(key)) {
      dfns.push(key + ' = ' + wrapAQL(this.dfns[key]));
    }
  }
  return prefix + 'COLLECT ' + dfns.join(', ') + ' INTO ' + this.varname;
};

function SortExpression(prev, args) {
  this.prev = prev;
  this.args = [];
  var allowKeyword = false, i, value;
  for (i = 0; i < args.length; i++) {
    value = args[i];
    if (!allowKeyword && value) {
      if (value instanceof Keyword || (
        typeof value === 'string' && SortExpression.keywords.indexOf(value.toUpperCase()) !== -1
      )) {
        throw new AqlError('Unexpected keyword ' + value.toString() + ' at offset ' + i);
      }
    }
    if (typeof value === 'string' && SortExpression.keywords.indexOf(value.toUpperCase()) !== -1) {
      this.args[i] = new Keyword(value);
      allowKeyword = false;
    } else {
      this.args[i] = autoCastToken(value);
      allowKeyword = true;
    }
  }
}
SortExpression.keywords = ['ASC', 'DESC'];
SortExpression.prototype = new PartialStatement();
SortExpression.prototype.constructor = SortExpression;
SortExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  if (this.offset !== undefined) {
    return prefix + 'LIMIT ' + wrapAQL(this.offset) + ', ' + wrapAQL(this.count);
  }
  return prefix + 'LIMIT ' + wrapAQL(this.count);
};

function LimitExpression(prev, offset, count) {
  if (count === undefined) {
    count = offset;
    offset = undefined;
  }
  this.prev = prev;
  this.offset = offset === undefined ? null : autoCastToken(offset);
  this.count = autoCastToken(count);
}
LimitExpression.prototype = new PartialStatement();
LimitExpression.prototype.constructor = LimitExpression;
LimitExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  if (this.offset !== undefined) {
    return prefix + 'LIMIT ' + wrapAQL(this.offset) + ', ' + wrapAQL(this.count);
  }
  return prefix + 'LIMIT ' + wrapAQL(this.count);
};

function Statement() {}
Statement.prototype = new Expression();
Statement.prototype.constructor = Statement;

function ReturnExpression(prev, value) {
  this.prev = prev;
  this.value = autoCastToken(value);
}
ReturnExpression.prototype = new Statement();
ReturnExpression.prototype.constructor = ReturnExpression;
ReturnExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  return prefix + 'RETURN ' + wrapAQL(this.value);
};

function RemoveExpression(prev, expr, collection, opts) {
  this.prev = prev;
  this.expr = autoCastToken(expr);
  this.collection = new Identifier(collection);
  this.opts = opts === undefined ? null : autoCastToken(opts);
}
RemoveExpression.prototype = new Statement();
RemoveExpression.prototype.constructor = RemoveExpression;
RemoveExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var suffix = (this.opts ? ' ' + wrapAQL(this.opts) : '');
  return prefix + (
    'REMOVE ' + wrapAQL(this.expr) + ' IN ' + wrapAQL(this.collection)
  ) + suffix;
};

function InsertExpression(prev, expr, collection, opts) {
  this.prev = prev;
  this.expr = autoCastToken(expr);
  this.collection = new Identifier(collection);
  this.opts = opts === undefined ? null : autoCastToken(opts);
}
InsertExpression.prototype = new Statement();
InsertExpression.prototype.constructor = InsertExpression;
InsertExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var suffix = (this.opts ? ' ' + wrapAQL(this.opts) : '');
  return prefix + (
    'INSERT ' + wrapAQL(this.expr) + ' INTO ' + wrapAQL(this.collection)
  ) + suffix;
};

function UpdateExpression(prev, expr, withExpr, collection, opts) {
  this.prev = prev;
  this.expr = autoCastToken(expr);
  this.withExpr = autoCastToken(withExpr);
  this.collection = new Identifier(collection);
  this.opts = opts === undefined ? null : autoCastToken(opts);
}
UpdateExpression.prototype = new Statement();
UpdateExpression.prototype.constructor = UpdateExpression;
UpdateExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var suffix = (this.opts ? ' ' + wrapAQL(this.opts) : '');
  return prefix + (
    'UPDATE ' + wrapAQL(this.expr) + ' WITH ' + wrapAQL(this.withExpr) + ' IN ' + wrapAQL(this.collection)
  ) + suffix;
};

function ReplaceExpression(prev, expr, withExpr, collection, opts) {
  this.prev = prev;
  this.expr = autoCastToken(expr);
  this.withExpr = autoCastToken(withExpr);
  this.collection = new Identifier(collection);
  this.opts = opts === undefined ? null : autoCastToken(opts);
}
ReplaceExpression.prototype = new Statement();
ReplaceExpression.prototype.constructor = ReplaceExpression;
ReplaceExpression.prototype.toAQL = function () {
  var prefix = (this.prev ? wrapAQL(this.prev) + ' ' : '');
  var suffix = (this.opts ? ' ' + wrapAQL(this.opts) : '');
  return prefix + (
    'REPLACE ' + wrapAQL(this.expr) + ' WITH ' + wrapAQL(this.withExpr) + ' IN ' + wrapAQL(this.collection)
  ) + suffix;
};

exports.autoCastToken = autoCastToken;
exports._Expression = Expression;
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
exports.Identifier = Identifier;
exports.SimpleReference = SimpleReference;
exports.UnaryOperation = UnaryOperation;
exports.BinaryOperation = BinaryOperation;
exports.TernaryOperation = TernaryOperation;
exports.FunctionCall = FunctionCall;

exports._PartialStatement = PartialStatement;
exports._Statement = Statement;
exports.ForExpression = ForExpression;
exports.FilterExpression = FilterExpression;
exports.LetExpression = LetExpression;
exports.CollectExpression = CollectExpression;
exports.CollectIntoExpression = CollectIntoExpression;
exports.SortExpression = SortExpression;
exports.LimitExpression = LimitExpression;
exports.ReturnExpression = ReturnExpression;
exports.RemoveExpression = RemoveExpression;
exports.InsertExpression = InsertExpression;
exports.UpdateExpression = UpdateExpression;
exports.ReplaceExpression = ReplaceExpression;
