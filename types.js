/* jshint globalstrict: true, es3: true */
/* globals require: false, exports: false */
'use strict';
var AqlError = require('./errors').AqlError;

function autoCastToken(token) {
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
  var value = [];
  for (var i = 0; i < this.value.length; i++) {
    value.push(this.value[i].toAQL());
  }
  return '[' + value.join(', ') + ']';
};
ListLiteral.prototype.toString = function () {
  var value = [];
  for (var i = 0; i < this.value.length; i++) {
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
  var value = [];
  for (var key in this.value) {
    if (this.value.hasOwnProperty(key)) {
      value.push(JSON.stringify(key) + ': ' + this.value[key].toAQL());
    }
  }
  return '{' + value.join(', ') + '}';
};
ObjectLiteral.prototype.toString = function () {
  var value = [];
  for (var key in this.value) {
    if (this.value.hasOwnProperty(key)) {
      value.push(JSON.stringify(key) + ': ' + this.value[key].toString());
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
  return this.start.toAQL() + '..' + this.end.toAQL();
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
  return this.obj.toAQL() + '[' + this.key.toAQL() + ']';
};
PropertyAccess.prototype.toString = function () {
  return this.obj.toString() + '[' + this.key.toString() + ']';
};

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
SimpleReference.prototype.toAQL = function () {return String(this.value);};
SimpleReference.prototype.toString = fromAqlWithType('ref');

function UnaryOperation(operator, value) {
  this.operator = operator;
  this.value = autoCastToken(value);
}
UnaryOperation.prototype = new Operation();
UnaryOperation.prototype.constructor = UnaryOperation;
UnaryOperation.prototype.toAQL = function () {
  if (this.value instanceof Operation) {
    return this.operator + '(' + this.value.toAQL() + ')';
  }
  return this.operator + this.value.toAQL();
};
UnaryOperation.prototype.toString = function () {
  if (this.value instanceof Operation) {
    return this.operator + '(' + this.value.toString() + ')';
  }
  return this.operator + this.value.toAQL();
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
    this.a instanceof Operation ? '(' + this.a.toAQL() + ')' : this.a.toAQL(),
    this.operator,
    this.b instanceof Operation ? '(' + this.b.toAQL() + ')' : this.b.toAQL()
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
    this.a instanceof Operation ? '(' + this.a.toAQL() + ')' : this.a.toAQL(),
    this.operator1,
    this.b instanceof Operation ? '(' + this.b.toAQL() + ')' : this.b.toAQL(),
    this.operator2,
    this.c instanceof Operation ? '(' + this.c.toAQL() + ')' : this.c.toAQL()
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
  var args = [];
  for (var i = 0; i < this.args.length; i++) {
    args.push(this.args[i].toAQL());
  }
  return this.functionName + '(' + args.join(', ') + ')';
};
FunctionCall.prototype.toString = function () {
  var args = [];
  for (var i = 0; i < this.args.length; i++) {
    args.push(this.args[i].toString());
  }
  return this.functionName + '(' + args.join(', ') + ')';
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
exports.SimpleReference = SimpleReference;
exports.UnaryOperation = UnaryOperation;
exports.BinaryOperation = BinaryOperation;
exports.TernaryOperation = TernaryOperation;
exports.FunctionCall = FunctionCall;