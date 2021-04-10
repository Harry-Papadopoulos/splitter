(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":6,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":7,"inherits":2}],5:[function(require,module,exports){
(function (global){(function (){
/*global window, global*/
var util = require("util")
var assert = require("assert")
function now() { return new Date().getTime() }

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"],
    [info, "info"],
    [warn, "warn"],
    [error, "error"],
    [time, "time"],
    [timeEnd, "timeEnd"],
    [trace, "trace"],
    [dir, "dir"],
    [consoleAssert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    delete times[label]
    var duration = now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function consoleAssert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":1,"util":10}],6:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],8:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],9:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],10:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"./support/isBuffer":9,"_process":7,"dup":4,"inherits":8}],11:[function(require,module,exports){
// Application that keeps track of who owes what to who. 

/*
THE LOGIC OF THE APP STARTS HERE!!  ////////////////////////////////////////////////////////////////
*/

const { debug } = require("console");
const dinero = require("dinero.js");


var participants = [];        // an array to hold the participants

// a constructor to make a new participant
function Participant(name) {
  this.name = name;
  this.moneyPutIn = dinero({ amount: 0, currency: "EUR" });     // money they have contributed
  this.expenses = [];       // the name and amount of what the participant has paid
  this.owed = [];         // what is owed to who  
  this.totalOutstanding = dinero({ amount: 0, currency: "EUR" }); // outstanding amount to be paid or received.
  this.expensePaid = function (expenseName, cash) {      // a method that adds a participant's expenses to 
    var money = dinero({ amount: Math.round(cash * 100), currency: "EUR" })
    this.expenses.push({ expense: expenseName, paid: money });   // his expenses list and to his total paid.
    this.moneyPutIn = this.moneyPutIn.add(money);    // add to total balance
    return money;
  }
}


// adds a participant to the participants array 
function addParticipant(participants, person) {
  participants.push(person);
  return participants;
}


// a function to calculate the total money in the pot
function totalAmount(participants) {
  var total = dinero({ amount: 0, currency: "EUR" });
  for (var i = 0; i < participants.length; i++) {
    total = total.add(participants[i].moneyPutIn);
  }
  return total;
}

// What each participant should end up paying.
function averageAmount(participants) {
  return totalAmount(participants).divide(participants.length)
}

// Balances out the remaining cents.
function remainder(participants) {
  var rest = totalAmount(participants).subtract(averageAmount(participants).multiply(participants.length)).getAmount();
  if (rest < -1) {
    for (let i = 0; i < Math.abs(rest); i++) {
      participants[i].totalOutstanding = participants[i].totalOutstanding.add(dinero({ amount: 1, currency: "EUR" }));
    }
  } else if (rest > 1) {
    for (let i = 0; i < Math.abs(rest); i++) {
      participants[i].totalOutstanding = participants[i].totalOutstanding.subtract(dinero({ amount: 1, currency: "EUR" }));
    }
  }
}


//calculates what each person has put in, in relation to the average
function outstandings(averageAmount, participants) {
  var average = averageAmount(participants)
  for (var i = 0; i < participants.length; i++) {
    participants[i].totalOutstanding = participants[i].moneyPutIn.subtract(average);
  }
  remainder(participants);
}


// checks if there are any possitive amounts matching negative ones
function equalAmountChecker(pax) {
  for (var i = 0; i < pax.length; i++) {    // loop through from first element
    for (var j = 1; j < pax.length - i; j++) {   //loop through the elements starting from the one after the above
      if (!pax[i].totalOutstanding.equalsTo(dinero({ amount: 0, currency: "EUR" })) && pax[i].totalOutstanding.add(pax[i + j].totalOutstanding).equalsTo(dinero({ amount: 0, currency: "EUR" }))) {
        if (pax[i].totalOutstanding.greaterThan(pax[i + j].totalOutstanding)) {
          pax[i + j].owed.push({ owedTo: pax[i].name, owed: pax[i + j].totalOutstanding })  //adds who owes what to who.
          pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });  // balance thins out between the two participants
          pax[i + j].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
          console.log(pax[i].name + pax[i + j].name);
        } else {
          pax[i].owed.push({ owedTo: pax[i + j].name, owed: pax[i].totalOutstanding }) // same as above
          pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
          pax[i + j].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
        }
      }
    }
  }
}


//sort function to order the outstanding amounts in decending order.
function orderer(person1, person2) {
  if (person1.totalOutstanding.greaterThan(person2.totalOutstanding)) {
    return -1;
  } else if (person1.totalOutstanding.equalsTo(person2.totalOutstanding)) {
    return 0;
  } else {
    return 1;
  }
}


//balance out everyones outstandings 
function equalizer(pax) {
  pax.sort(orderer);
  for (var j = 0; j < 100; j++) {
    for (var i = 0; i < pax.length / 2; i++) {
      if (pax[i].totalOutstanding.greaterThan(pax[pax.length - 1 - i].totalOutstanding) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" })) && pax[pax.length - 1 - i].totalOutstanding.lessThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[i].totalOutstanding = pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding);
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: pax[pax.length - 1 - i].totalOutstanding })
        pax[pax.length - 1 - i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      } else if (pax[i].totalOutstanding.lessThan(pax[pax.length - 1 - i].totalOutstanding) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" })) && pax[pax.length - 1 - i].totalOutstanding.lessThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[pax.length - 1 - i].totalOutstanding = pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding);
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: (pax[i].totalOutstanding) })
        pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      } else if (pax[i].totalOutstanding.add(pax[pax.length - 1 - i].totalOutstanding).equalsTo(dinero({ amount: 0, currency: "EUR" })) && pax[i].totalOutstanding.greaterThan(dinero({ amount: 0, currency: "EUR" }))) {
        pax[pax.length - 1 - i].owed.push({ owedTo: pax[i].name, owed: pax[pax.length - 1 - i].totalOutstanding })
        pax[i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
        pax[pax.length - 1 - i].totalOutstanding = dinero({ amount: 0, currency: "EUR" });
      }
    }
    pax.sort(orderer);
  }
}

// Clear what everyone owes to eachother.
function clearOwed(participants) {
  for (let i = 0; i < participants.length; i++) {
    participants[i].owed = [];
  }
}

// Re-compute everyones debts.
function computeDebts(participants) {
  clearOwed(participants);
  outstandings(averageAmount, participants);
  equalAmountChecker(participants);
  equalizer(participants);
}



/*
THE INTERACTION WITH THE DOM STARTS HERE!! ////////////////////////////////////////////////////////////////
*/


// Button to add a participant.
var nameButton = document.getElementById("name-button");
nameButton.onclick = inputParticipant;


// Button to add an expense.
var expenseButton = document.getElementById("expense-button");
expenseButton.onclick = inputExpense;


// Button to delete a participant.
var deleteButton = document.getElementById("delete-button");
deleteButton.onclick = deleteParticipant;


// Button to delete an expense.
var deleteExpenseButton = document.getElementById("delete-expense-button");
deleteExpenseButton.onclick = deleteExpense;


//Setting up the enter key for the forms

var forms = ["name-form", "expense-form",  "delete-form", "delete-expense-form"];
var buttons = ["name-button", "expense-button",  "delete-button", "delete-expense-button"]

function setKeySubmision(forms, buttons) {
  for (let i = 0; i < 4; i++) {
    let form = document.getElementById(forms[i]);
    let button = document.getElementById(buttons[i]);
    form.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        e.preventDefault();
        button.click();
        return false;
      }
    })
  }
}

setKeySubmision(forms, buttons);
totalExpeditureInGui(participants);


// Add a participant to the application
function inputParticipant() {
  var inserted = document.getElementById("new-name");
  if (inserted.value == "") {
    alert("Please enter a participant before submitting.")
  } else {
    var person = new Participant(inserted.value);
    addParticipant(participants, person);
    inserted.value = "";
    computeDebts(participants);
    participantInGui(person);
    globalUpdateGui(participants);
  }
}


//Add an expense for a participant 
function inputExpense() {
  let person = document.getElementById("payer-name");
  let expenseName = document.getElementById("expense-name");
  let amount = document.getElementById("expense-amount");
  let isParticipant = false;
  if (!expenseName.value) {
    alert("There was no expense typed.")
  } else if (!amount.value) {
    alert("There was no amount typed.")
  } else {
    for (let i = 0; i < participants.length; i++) {
      if (person.value == participants[i].name) {
        participants[i].expensePaid(expenseName.value, amount.value);
        computeDebts(participants);
        globalUpdateGui(participants);
        isParticipant = true;
        break;
      }
    }
    if (!isParticipant) {
      alert("Please enter a valid participant name.");
    }
    totalExpeditureInGui(participants);
    person.value = "";
    expenseName.value = "";
    amount.value = "";
  }
}


/*
Displaying outputs starts here. /////////////////////////////////////////////////////////////////////////////
*/


//Add a participant to the gui
function participantInGui(participant) {
  let participantToggle = document.createElement("select");
  participantToggle.setAttribute("id", participant.name);
  participantInfoGui(participant, participantToggle);
  let place = document.getElementById("individual-outputs");
  place.appendChild(participantToggle);
}

//Update participant information in the gui
function participantUpdateGui(participant) {
  let newToggle = document.createElement("select");
  participantInfoGui(participant, newToggle);
  let oldToggle = document.getElementById(participant.name)
  let place = document.getElementById("individual-outputs");
  place.replaceChild(newToggle, oldToggle);
  newToggle.setAttribute("id", participant.name);
}

// Update everybody's information in the gui.
function globalUpdateGui(participants) {
  for (let i = 0; i < participants.length; i++) {
    participantUpdateGui(participants[i]);
  }
  totalExpeditureInGui(participants);
}


//Participant information for the gui
function participantInfoGui(participant, participantToggle) {
  participantNameInGui(participant, participantToggle);
  participantContributionInGui(participant, participantToggle);
  participantExpensesInGui(participant, participantToggle);
  participantOwedInGui(participant, participantToggle);
}


// Display the participant's name in an option element of the select element.
function participantNameInGui(participant, participantToggle) {
  let nameTag = document.createElement("option");
  let name = document.createTextNode(participant.name);
  nameTag.appendChild(name);
  participantToggle.appendChild(nameTag)
}

// Display the participant's total money put in, in an option element of the select element.
function participantContributionInGui(participant, participantToggle) {
  let contributionTag = document.createElement("option");
  let contribution = document.createTextNode("Amount Contributed: " + participant.moneyPutIn.toFormat());
  contributionTag.appendChild(contribution);
  participantToggle.appendChild(contributionTag);
  contributionTag.setAttribute("disabled", "disabled");
}

// Display the participant's expenses, in an option element of the select element.
function participantExpensesInGui(participant, participantToggle) {
  let bills = "Nothing has been paid yet.";
  if (participant.expenses.length >= 1) {
    bills = "Expenses Paid: " + participant.expenses[0].expense + "- " + participant.expenses[0].paid.toFormat();
    if (participant.expenses.length > 1) {
      for (let i = 1; i < participant.expenses.length; i++) {
        bills = bills.concat(", " + participant.expenses[i].expense + "- " + participant.expenses[i].paid.toFormat());
      }
    }
  }
  let billsPaid = document.createTextNode(bills);
  let expenseTag = document.createElement("option");
  expenseTag.appendChild(billsPaid);
  participantToggle.appendChild(expenseTag);
  expenseTag.setAttribute("disabled", "disabled");
}

// Display what the participant owes, in an option element of the select element.
function participantOwedInGui(participant, participantToggle) {
  let debts = "Nothing is owed.";
  if (participant.owed.length >= 1) {
    debts = "Money owed: " + participant.owed[0].owedTo + " " + participant.owed[0].owed.toFormat();
    if (participant.owed.length > 1) {
      for (let i = 1; i < participant.owed.length; i++) {
        debts = debts.concat(", " + participant.owed[i].owedTo + " " + participant.owed[i].owed.toFormat());
      }
    }
  }
  let debtsOwed = document.createTextNode(debts);
  let owedTag = document.createElement("option");
  owedTag.appendChild(debtsOwed);
  participantToggle.appendChild(owedTag);
  owedTag.setAttribute("disabled", "disabled");
}

//Update the total expediture in the gui.
function totalExpeditureInGui(participants) {
  let totalExpediture;
  if (!participants) {
    totalExpediture = "Total Expediture: €0.00"
  } else {
    totalExpediture = "Total Expediture: " + totalAmount(participants).toFormat();
  }
  let expeditureNode = document.getElementById("total-expediture");
  expeditureNode.innerHTML = totalExpediture;
}


//Delete a participant.
function deleteParticipant() {
  let inserted = document.getElementById("delete-name");
  let person = inserted.value;
  let isParticipant = false;
  for (let i = 0; i < participants.length; i++) {
    if (person == participants[i].name) {
      let toggle = document.getElementById(participants[i].name);
      toggle.remove();
      participants.splice(i, 1);
      isParticipant = true;
      break
    }
  }
  if (!isParticipant) {
    alert("Please enter a valid participant name.");
  }
  inserted.value = "";
  debugger;
  if (!participants) {
    totalExpeditureInGui(participants);
  } else {
    computeDebts(participants);
    globalUpdateGui(participants);
  }
}


//Delete an expense.
function deleteExpense() {
  let person = document.getElementById("expense-delete-participant");
  let expenseName = document.getElementById("expense-delete");
  let isParticipant = false;
  let isExpense = false;
  if (!person.value) {
    alert("Please enter a participant's name.");
  } else if (!expenseName.value) {
    alert("Please enter an expense.");
  } else {
    for (let i = 0; i < participants.length; i++) {
      if (person.value == participants[i].name) {
        isParticipant = true;
        for (let j = 0; j < participants[i].expenses.length; j++) {
          if (expenseName.value == participants[i].expenses[j].expense) {
            participants[i].moneyPutIn = participants[i].moneyPutIn.subtract(participants[i].expenses[j].paid);
            participants[i].expenses.splice(j, 1);
            isExpense = true;
            break
          }
        }
      }
    }
    if (!isParticipant) {
      alert("Please enter a valid participant name.");
    } else if (!isExpense) {
      alert("Please enter a valid expense name.");
    }
    person.value = "";
    expenseName.value = ""
    computeDebts(participants);
    globalUpdateGui(participants);
  }
}




/*
var nameForm = document.getElementById("name-form");
nameForm.addEventListener("keydown", keyEnterName);

function keyEnterName(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    nameButton.click();
    return false;
  }
}
*/

/*
var deleteForm = document.getElementById("delete-form");
deleteForm.addEventListener("keydown", keyDeleteParticipant);

function keyDeleteParticipant(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    deleteButton.click();
    return false;
  }
}
*/

/*
var deleteExpenseForm = document.getElementById("delete-expense-form");
deleteExpenseForm.addEventListener("keydown", keyDeleteExpense);

function keyDeleteExpense(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    deleteExpenseButton.click();
    return false;
  }
}
*/

/*
var expenseForm = document.getElementById("expense-form");
expenseForm.addEventListener("keydown", keyEnterExpense);

function keyEnterExpense(key) {
  if (key.keyCode == "13") {
    key.preventDefault();
    expenseButton.click();
    return false;
  }
}
*/

/*
// Initialize the total expediture.
var totalExpediture = "Total Expediture: €0.00"
var expeditureNode = document.getElementById("total-expediture");
expeditureNode.innerHTML = totalExpediture;
*/
},{"console":5,"dinero.js":12}],12:[function(require,module,exports){
'use strict';

/**
 * Default values for all Dinero objects.
 *
 * You can override default values for all subsequent Dinero objects by changing them directly on the global `Dinero` object.
 * Existing instances won't be affected.
 *
 * @property {Number} defaultAmount - The default amount for new Dinero objects (see {@link module:Dinero Dinero} for format).
 * @property {String} defaultCurrency - The default currency for new Dinero objects (see {@link module:Dinero Dinero} for format).
 * @property {Number} defaultPrecision - The default precision for new Dinero objects (see {@link module:Dinero Dinero} for format).
 *
 * @example
 * // Will set currency to 'EUR' for all Dinero objects.
 * Dinero.defaultCurrency = 'EUR'
 *
 * @type {Object}
 */
var Defaults = {
  defaultAmount: 0,
  defaultCurrency: 'USD',
  defaultPrecision: 2
};
/**
 * Global settings for all Dinero objects.
 *
 * You can override global values for all subsequent Dinero objects by changing them directly on the global `Dinero` object.
 * Existing instances won't be affected.
 *
 * @property {String}  globalLocale - The global locale for new Dinero objects (see {@link module:Dinero~setLocale setLocale} for format).
 * @property {String}  globalFormat - The global format for new Dinero objects (see {@link module:Dinero~toFormat toFormat} for format).
 * @property {String}  globalRoundingMode - The global rounding mode for new Dinero objects (see {@link module:Dinero~multiply multiply} or {@link module:Dinero~divide divide} for format).
 * @property {String}  globalFormatRoundingMode - The global rounding mode to format new Dinero objects (see {@link module:Dinero~toFormat toFormat} or {@link module:Dinero~toRoundedUnit toRoundedUnit} for format).
 * @property {(String|Promise)}  globalExchangeRatesApi.endpoint - The global exchange rate API endpoint for new Dinero objects, or the global promise that resolves to the exchanges rates (see {@link module:Dinero~convert convert} for format).
 * @property {String}  globalExchangeRatesApi.propertyPath - The global exchange rate API property path for new Dinero objects (see {@link module:Dinero~convert convert} for format).
 * @property {Object}  globalExchangeRatesApi.headers - The global exchange rate API headers for new Dinero objects (see {@link module:Dinero~convert convert} for format).
 *
 * @example
 * // Will set locale to 'fr-FR' for all Dinero objects.
 * Dinero.globalLocale = 'fr-FR'
 * @example
 * // Will set global exchange rate API parameters for all Dinero objects.
 * Dinero.globalExchangeRatesApi = {
 *  endpoint: 'https://yourexchangerates.api/latest?base={{from}}',
 *  propertyPath: 'data.rates.{{to}}',
 *  headers: {
 *    'user-key': 'xxxxxxxxx'
 *  }
 * }
 *
 * @type {Object}
 */

var Globals = {
  globalLocale: 'en-US',
  globalFormat: '$0,0.00',
  globalRoundingMode: 'HALF_EVEN',
  globalFormatRoundingMode: 'HALF_AWAY_FROM_ZERO',
  globalExchangeRatesApi: {
    endpoint: undefined,
    headers: undefined,
    propertyPath: undefined
  }
};

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * Static methods for Dinero.
 * @ignore
 *
 * @type {Object}
 */
var Static = {
  /**
   * Returns an array of Dinero objects, normalized to the same precision (the highest).
   *
   * @memberof module:Dinero
   * @method
   *
   * @param {Dinero[]} objects - An array of Dinero objects
   *
   * @example
   * // returns an array of Dinero objects
   * // both with a precision of 3
   * // and an amount of 1000
   * Dinero.normalizePrecision([
   *   Dinero({ amount: 100, precision: 2 }),
   *   Dinero({ amount: 1000, precision: 3 })
   * ])
   *
   * @return {Dinero[]}
   */
  normalizePrecision: function normalizePrecision(objects) {
    var highestPrecision = objects.reduce(function (a, b) {
      return Math.max(a.getPrecision(), b.getPrecision());
    });
    return objects.map(function (object) {
      return object.getPrecision() !== highestPrecision ? object.convertPrecision(highestPrecision) : object;
    });
  },

  /**
   * Returns the smallest Dinero object from an array of Dinero objects
   *
   * @memberof module:Dinero
   * @method
   *
   * @param {Dinero[]} objects - An array of Dinero objects
   *
   * @example
   * // returns the smallest Dinero object with amount of 500 from an array of Dinero objects with different precisions
   * Dinero.minimum([
   *   Dinero({ amount: 500, precision: 3 }),
   *   Dinero({ amount: 100, precision: 2 })
   * ])
   * @example
   * // returns the smallest Dinero object with amount of 50 from an array of Dinero objects
   * Dinero.minimum([
   *   Dinero({ amount: 50 }),
   *   Dinero({ amount: 100 })
   * ])
   *
   * @return {Dinero[]}
   */
  minimum: function minimum(objects) {
    var _objects = _toArray(objects),
        firstObject = _objects[0],
        tailObjects = _objects.slice(1);

    var currentMinimum = firstObject;
    tailObjects.forEach(function (obj) {
      currentMinimum = currentMinimum.lessThan(obj) ? currentMinimum : obj;
    });
    return currentMinimum;
  },

  /**
   * Returns the biggest Dinero object from an array of Dinero objects
   *
   * @memberof module:Dinero
   * @method
   *
   * @param {Dinero[]} objects - An array of Dinero objects
   *
   * @example
   * // returns the biggest Dinero object with amount of 20, from an array of Dinero objects with different precisions
   * Dinero.maximum([
   *   Dinero({ amount: 20, precision: 2 }),
   *   Dinero({ amount: 150, precision: 3 })
   * ])
   * @example
   * // returns the biggest Dinero object with amount of 100, from an array of Dinero objects
   * Dinero.maximum([
   *   Dinero({ amount: 100 }),
   *   Dinero({ amount: 50 })
   * ])
   *
   * @return {Dinero[]}
   */
  maximum: function maximum(objects) {
    var _objects2 = _toArray(objects),
        firstObject = _objects2[0],
        tailObjects = _objects2.slice(1);

    var currentMaximum = firstObject;
    tailObjects.forEach(function (obj) {
      currentMaximum = currentMaximum.greaterThan(obj) ? currentMaximum : obj;
    });
    return currentMaximum;
  }
};

/**
 * Returns whether a value is numeric.
 * @ignore
 *
 * @param  {} value - The value to test.
 *
 * @return {Boolean}
 */
function isNumeric(value) {
  return !isNaN(parseInt(value)) && isFinite(value);
}
/**
 * Returns whether a value is a percentage.
 * @ignore
 *
 * @param  {}  percentage - The percentage to test.
 *
 * @return {Boolean}
 */

function isPercentage(percentage) {
  return isNumeric(percentage) && percentage <= 100 && percentage >= 0;
}
/**
 * Returns whether an array of ratios is valid.
 * @ignore
 *
 * @param  {}  ratios - The ratios to test.
 *
 * @return {Boolean}
 */

function areValidRatios(ratios) {
  return ratios.length > 0 && ratios.every(function (ratio) {
    return ratio >= 0;
  }) && ratios.some(function (ratio) {
    return ratio > 0;
  });
}
/**
 * Returns whether a value is even.
 * @ignore
 *
 * @param  {Number} value - The value to test.
 *
 * @return {Boolean}
 */

function isEven(value) {
  return value % 2 === 0;
}
/**
 * Returns whether a value is a float.
 * @ignore
 *
 * @param  {}  value - The value to test.
 *
 * @return {Boolean}
 */

function isFloat(value) {
  return isNumeric(value) && !Number.isInteger(value);
}
/**
 * Returns how many fraction digits a number has.
 * @ignore
 *
 * @param  {Number} [number=0] - The number to test.
 *
 * @return {Number}
 */

function countFractionDigits() {
  var number = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var stringRepresentation = number.toString();

  if (stringRepresentation.indexOf('e-') > 0) {
    // It's too small for a normal string representation, e.g. 1e-7 instead of 0.00000001
    return parseInt(stringRepresentation.split('e-')[1]);
  } else {
    var fractionDigits = stringRepresentation.split('.')[1];
    return fractionDigits ? fractionDigits.length : 0;
  }
}
/**
 * Returns whether a number is half.
 * @ignore
 *
 * @param {Number} number - The number to test.
 *
 * @return {Number}
 */

function isHalf(number) {
  return Math.abs(number) % 1 === 0.5;
}
/**
 * Fetches a JSON resource.
 * @ignore
 *
 * @param  {String} url - The resource to fetch.
 * @param  {Object} [options.headers] - The headers to pass.
 *
 * @throws {Error} If `request.status` is lesser than 200 or greater or equal to 400.
 * @throws {Error} If network fails.
 *
 * @return {JSON}
 */

function getJSON(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    var request = Object.assign(new XMLHttpRequest(), {
      onreadystatechange: function onreadystatechange() {
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status < 400) resolve(JSON.parse(request.responseText));else reject(new Error(request.statusText));
        }
      },
      onerror: function onerror() {
        reject(new Error('Network error'));
      }
    });
    request.open('GET', url, true);
    setXHRHeaders(request, options.headers);
    request.send();
  });
}
/**
 * Returns an XHR object with attached headers.
 * @ignore
 *
 * @param {XMLHttpRequest} xhr - The XHR request to set headers to.
 * @param {Object} headers - The headers to set.
 *
 * @return {XMLHttpRequest}
 */

function setXHRHeaders(xhr) {
  var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  return xhr;
}
/**
 * Returns whether a value is undefined.
 * @ignore
 *
 * @param {} value - The value to test.
 *
 * @return {Boolean}
 */

function isUndefined(value) {
  return typeof value === 'undefined';
}
/**
 * Returns an object flattened to one level deep.
 * @ignore
 *
 * @param {Object} object - The object to flatten.
 * @param {String} separator - The separator to use between flattened nodes.
 *
 * @return {Object}
 */

function flattenObject(object) {
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.';
  var finalObject = {};
  Object.entries(object).forEach(function (item) {
    if (_typeof(item[1]) === 'object') {
      var flatObject = flattenObject(item[1]);
      Object.entries(flatObject).forEach(function (node) {
        finalObject[item[0] + separator + node[0]] = node[1];
      });
    } else {
      finalObject[item[0]] = item[1];
    }
  });
  return finalObject;
}
/**
 * Returns whether a value is thenable.
 * @ignore
 *
 * @param {} value - The value to test.
 *
 * @return {Boolean}
 */

function isThenable(value) {
  return Boolean(value) && (_typeof(value) === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

function Calculator() {
  var floatMultiply = function floatMultiply(a, b) {
    var getFactor = function getFactor(number) {
      return Math.pow(10, countFractionDigits(number));
    };

    var factor = Math.max(getFactor(a), getFactor(b));
    return Math.round(a * factor) * Math.round(b * factor) / (factor * factor);
  };

  var roundingModes = {
    HALF_ODD: function HALF_ODD(number) {
      var rounded = Math.round(number);
      return isHalf(number) ? isEven(rounded) ? rounded - 1 : rounded : rounded;
    },
    HALF_EVEN: function HALF_EVEN(number) {
      var rounded = Math.round(number);
      return isHalf(number) ? isEven(rounded) ? rounded : rounded - 1 : rounded;
    },
    HALF_UP: function HALF_UP(number) {
      return Math.round(number);
    },
    HALF_DOWN: function HALF_DOWN(number) {
      return isHalf(number) ? Math.floor(number) : Math.round(number);
    },
    HALF_TOWARDS_ZERO: function HALF_TOWARDS_ZERO(number) {
      return isHalf(number) ? Math.sign(number) * Math.floor(Math.abs(number)) : Math.round(number);
    },
    HALF_AWAY_FROM_ZERO: function HALF_AWAY_FROM_ZERO(number) {
      return isHalf(number) ? Math.sign(number) * Math.ceil(Math.abs(number)) : Math.round(number);
    },
    DOWN: function DOWN(number) {
      return Math.floor(number);
    }
  };
  return {
    /**
     * Returns the sum of two numbers.
     * @ignore
     *
     * @param {Number} a - The first number to add.
     * @param {Number} b - The second number to add.
     *
     * @return {Number}
     */
    add: function add(a, b) {
      return a + b;
    },

    /**
     * Returns the difference of two numbers.
     * @ignore
     *
     * @param {Number} a - The first number to subtract.
     * @param {Number} b - The second number to subtract.
     *
     * @return {Number}
     */
    subtract: function subtract(a, b) {
      return a - b;
    },

    /**
     * Returns the product of two numbers.
     * @ignore
     *
     * @param {Number} a - The first number to multiply.
     * @param {Number} b - The second number to multiply.
     *
     * @return {Number}
     */
    multiply: function multiply(a, b) {
      return isFloat(a) || isFloat(b) ? floatMultiply(a, b) : a * b;
    },

    /**
     * Returns the quotient of two numbers.
     * @ignore
     *
     * @param {Number} a - The first number to divide.
     * @param {Number} b - The second number to divide.
     *
     * @return {Number}
     */
    divide: function divide(a, b) {
      return a / b;
    },

    /**
     * Returns the remainder of two numbers.
     * @ignore
     *
     * @param  {Number} a - The first number to divide.
     * @param  {Number} b - The second number to divide.
     *
     * @return {Number}
     */
    modulo: function modulo(a, b) {
      return a % b;
    },

    /**
     * Returns a rounded number based off a specific rounding mode.
     * @ignore
     *
     * @param {Number} number - The number to round.
     * @param {String} [roundingMode='HALF_EVEN'] - The rounding mode to use.
     *
     * @returns {Number}
     */
    round: function round(number) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'HALF_EVEN';
      return roundingModes[roundingMode](number);
    }
  };
}

var calculator = Calculator();
function Format(format) {
  var matches = /^(?:(\$|USD)?0(?:(,)0)?(\.)?(0+)?|0(?:(,)0)?(\.)?(0+)?\s?(dollar)?)$/gm.exec(format);
  return {
    /**
     * Returns the matches.
     * @ignore
     *
     * @return {Array}
     */
    getMatches: function getMatches() {
      return matches !== null ? matches.slice(1).filter(function (match) {
        return !isUndefined(match);
      }) : [];
    },

    /**
     * Returns the amount of fraction digits to display.
     * @ignore
     *
     * @return {Number}
     */
    getMinimumFractionDigits: function getMinimumFractionDigits() {
      var decimalPosition = function decimalPosition(match) {
        return match === '.';
      };

      return !isUndefined(this.getMatches().find(decimalPosition)) ? this.getMatches()[calculator.add(this.getMatches().findIndex(decimalPosition), 1)].split('').length : 0;
    },

    /**
     * Returns the currency display mode.
     * @ignore
     *
     * @return {String}
     */
    getCurrencyDisplay: function getCurrencyDisplay() {
      var modes = {
        USD: 'code',
        dollar: 'name',
        $: 'symbol'
      };
      return modes[this.getMatches().find(function (match) {
        return match === 'USD' || match === 'dollar' || match === '$';
      })];
    },

    /**
     * Returns the formatting style.
     * @ignore
     *
     * @return {String}
     */
    getStyle: function getStyle() {
      return !isUndefined(this.getCurrencyDisplay(this.getMatches())) ? 'currency' : 'decimal';
    },

    /**
     * Returns whether grouping should be used or not.
     * @ignore
     *
     * @return {Boolean}
     */
    getUseGrouping: function getUseGrouping() {
      return !isUndefined(this.getMatches().find(function (match) {
        return match === ',';
      }));
    }
  };
}

function CurrencyConverter(options) {
  /* istanbul ignore next */
  var mergeTags = function mergeTags() {
    var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var tags = arguments.length > 1 ? arguments[1] : undefined;

    for (var tag in tags) {
      string = string.replace("{{".concat(tag, "}}"), tags[tag]);
    }

    return string;
  };
  /* istanbul ignore next */


  var getRatesFromRestApi = function getRatesFromRestApi(from, to) {
    return getJSON(mergeTags(options.endpoint, {
      from: from,
      to: to
    }), {
      headers: options.headers
    });
  };

  return {
    /**
     * Returns the exchange rate.
     * @ignore
     *
     * @param  {String} from - The base currency.
     * @param  {String} to   - The destination currency.
     *
     * @return {Promise}
     */
    getExchangeRate: function getExchangeRate(from, to) {
      return (isThenable(options.endpoint) ? options.endpoint : getRatesFromRestApi(from, to)).then(function (data) {
        return flattenObject(data)[mergeTags(options.propertyPath, {
          from: from,
          to: to
        })];
      });
    }
  };
}

/**
 * Performs an assertion.
 * @ignore
 *
 * @param  {Boolean} condition - The expression to assert.
 * @param  {String}  errorMessage - The message to throw if the assertion fails
 * @param  {ErrorConstructor}   [ErrorType=Error] - The error to throw if the assertion fails.
 *
 * @throws {Error} If `condition` returns `false`.
 */

function assert(condition, errorMessage) {
  var ErrorType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Error;
  if (!condition) throw new ErrorType(errorMessage);
}
/**
 * Asserts a value is a percentage.
 * @ignore
 *
 * @param  {}  percentage - The percentage to test.
 *
 * @throws {RangeError} If `percentage` is out of range.
 */

function assertPercentage(percentage) {
  assert(isPercentage(percentage), 'You must provide a numeric value between 0 and 100.', RangeError);
}
/**
 * Asserts an array of ratios is valid.
 * @ignore
 *
 * @param  {}  ratios - The ratios to test.
 *
 * @throws {TypeError} If `ratios` are invalid.
 */

function assertValidRatios(ratios) {
  assert(areValidRatios(ratios), 'You must provide a non-empty array of numeric values greater than 0.', TypeError);
}
/**
 * Asserts a value is an integer.
 * @ignore
 *
 * @param  {}  number - The value to test.
 *
 * @throws {TypeError}
 */

function assertInteger(number) {
  assert(Number.isInteger(number), 'You must provide an integer.', TypeError);
}

var calculator$1 = Calculator();
/**
 * A Dinero object is an immutable data structure representing a specific monetary value.
 * It comes with methods for creating, parsing, manipulating, testing, transforming and formatting them.
 *
 * A Dinero object has:
 *
 * * An `amount`, expressed in minor currency units, as an integer.
 * * A `currency`, expressed as an {@link https://en.wikipedia.org/wiki/ISO_4217#Active_codes ISO 4217 currency code}.
 * * A `precision`, expressed as an integer, to represent the number of decimal places in the `amount`.
 *   This is helpful when you want to represent fractional minor currency units (e.g.: $10.4545).
 *   You can also use it to represent a currency with a different [exponent](https://en.wikipedia.org/wiki/ISO_4217#Treatment_of_minor_currency_units_.28the_.22exponent.22.29) than `2` (e.g.: Iraqi dinar with 1000 fils in 1 dinar (exponent of `3`), Japanese yen with no sub-units (exponent of `0`)).
 * * An optional `locale` property that affects how output strings are formatted.
 *
 * Here's an overview of the public API:
 *
 * * **Access:** {@link module:Dinero~getAmount getAmount}, {@link module:Dinero~getCurrency getCurrency}, {@link module:Dinero~getLocale getLocale} and {@link module:Dinero~getPrecision getPrecision}.
 * * **Manipulation:** {@link module:Dinero~add add}, {@link module:Dinero~subtract subtract}, {@link module:Dinero~multiply multiply}, {@link module:Dinero~divide divide}, {@link module:Dinero~percentage percentage}, {@link module:Dinero~allocate allocate} and {@link module:Dinero~convert convert}.
 * * **Testing:** {@link module:Dinero~equalsTo equalsTo}, {@link module:Dinero~lessThan lessThan}, {@link module:Dinero~lessThanOrEqual lessThanOrEqual}, {@link module:Dinero~greaterThan greaterThan}, {@link module:Dinero~greaterThanOrEqual greaterThanOrEqual}, {@link module:Dinero~isZero isZero}, {@link module:Dinero~isPositive isPositive}, {@link module:Dinero~isNegative isNegative}, {@link module:Dinero~hasSubUnits hasSubUnits}, {@link module:Dinero~hasSameCurrency hasSameCurrency} and {@link module:Dinero~hasSameAmount hasSameAmount}.
 * * **Configuration:** {@link module:Dinero~setLocale setLocale}.
 * * **Conversion & formatting:** {@link module:Dinero~toFormat toFormat}, {@link module:Dinero~toUnit toUnit}, {@link module:Dinero~toRoundedUnit toRoundedUnit}, {@link module:Dinero~toObject toObject}, {@link module:Dinero~toJSON toJSON}, {@link module:Dinero~convertPrecision convertPrecision} and {@link module:Dinero.normalizePrecision normalizePrecision}.
 *
 * Dinero.js uses `number`s under the hood, so it's constrained by the [double-precision floating-point format](https://en.wikipedia.org/wiki/Double-precision_floating-point_format). Using values over [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/MAX_SAFE_INTEGER) or below [`Number.MIN_SAFE_INTEGER`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/MIN_SAFE_INTEGER) will yield unpredictable results.
 * Same goes with performing calculations: once the internal `amount` value exceeds those limits, precision is no longer guaranteed.
 *
 * @module Dinero
 * @param  {Number} [options.amount=0] - The amount in minor currency units (as an integer).
 * @param  {String} [options.currency='USD'] - An ISO 4217 currency code.
 * @param  {String} [options.precision=2] - The number of decimal places to represent.
 *
 * @throws {TypeError} If `amount` or `precision` is invalid. Integers over [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/MAX_SAFE_INTEGER) or below [`Number.MIN_SAFE_INTEGER`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Number/MIN_SAFE_INTEGER) are considered valid, even though they can lead to imprecise amounts.
 *
 * @return {Object}
 */

var Dinero = function Dinero(options) {
  var _Object$assign = Object.assign({}, {
    amount: Dinero.defaultAmount,
    currency: Dinero.defaultCurrency,
    precision: Dinero.defaultPrecision
  }, options),
      amount = _Object$assign.amount,
      currency = _Object$assign.currency,
      precision = _Object$assign.precision;

  assertInteger(amount);
  assertInteger(precision);
  var globalLocale = Dinero.globalLocale,
      globalFormat = Dinero.globalFormat,
      globalRoundingMode = Dinero.globalRoundingMode,
      globalFormatRoundingMode = Dinero.globalFormatRoundingMode;
  var globalExchangeRatesApi = Object.assign({}, Dinero.globalExchangeRatesApi);
  /**
   * Uses ES5 function notation so `this` can be passed through call, apply and bind
   * @ignore
   */

  var create = function create(options) {
    var obj = Object.assign({}, Object.assign({}, {
      amount: amount,
      currency: currency,
      precision: precision
    }, options), Object.assign({}, {
      locale: this.locale
    }, options));
    return Object.assign(Dinero({
      amount: obj.amount,
      currency: obj.currency,
      precision: obj.precision
    }), {
      locale: obj.locale
    });
  };
  /**
   * Uses ES5 function notation so `this` can be passed through call, apply and bind
   * @ignore
   */


  var assertSameCurrency = function assertSameCurrency(comparator) {
    assert(this.hasSameCurrency(comparator), 'You must provide a Dinero instance with the same currency.', TypeError);
  };

  return {
    /**
     * Returns the amount.
     *
     * @example
     * // returns 500
     * Dinero({ amount: 500 }).getAmount()
     *
     * @return {Number}
     */
    getAmount: function getAmount() {
      return amount;
    },

    /**
     * Returns the currency.
     *
     * @example
     * // returns 'EUR'
     * Dinero({ currency: 'EUR' }).getCurrency()
     *
     * @return {String}
     */
    getCurrency: function getCurrency() {
      return currency;
    },

    /**
     * Returns the locale.
     *
     * @example
     * // returns 'fr-FR'
     * Dinero().setLocale('fr-FR').getLocale()
     *
     * @return {String}
     */
    getLocale: function getLocale() {
      return this.locale || globalLocale;
    },

    /**
     * Returns a new Dinero object with an embedded locale.
     *
     * @param {String} newLocale - The new locale as an {@link http://tools.ietf.org/html/rfc5646 BCP 47 language tag}.
     *
     * @example
     * // Returns a Dinero object with locale 'ja-JP'
     * Dinero().setLocale('ja-JP')
     *
     * @return {Dinero}
     */
    setLocale: function setLocale(newLocale) {
      return create.call(this, {
        locale: newLocale
      });
    },

    /**
     * Returns the precision.
     *
     * @example
     * // returns 3
     * Dinero({ precision: 3 }).getPrecision()
     *
     * @return {Number}
     */
    getPrecision: function getPrecision() {
      return precision;
    },

    /**
     * Returns a new Dinero object with a new precision and a converted amount.
     *
     * By default, fractional minor currency units are rounded using the **half to even** rule ([banker's rounding](http://wiki.c2.com/?BankersRounding)).
     * This can be necessary when you need to convert objects to a smaller precision.
     *
     * Rounding *can* lead to accuracy issues as you chain many times. Consider a minimal amount of subsequent conversions for safer results.
     * You can also specify a different `roundingMode` to better fit your needs.
     *
     * @param {Number} newPrecision - The new precision.
     * @param {String} [roundingMode='HALF_EVEN'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @example
     * // Returns a Dinero object with precision 3 and amount 1000
     * Dinero({ amount: 100, precision: 2 }).convertPrecision(3)
     *
     * @throws {TypeError} If `newPrecision` is invalid.
     *
     * @return {Dinero}
     */
    convertPrecision: function convertPrecision(newPrecision) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalFormatRoundingMode;
      assertInteger(newPrecision);
      return create.call(this, {
        amount: calculator$1.round(calculator$1.multiply(this.getAmount(), Math.pow(10, calculator$1.subtract(newPrecision, this.getPrecision()))), roundingMode),
        precision: newPrecision
      });
    },

    /**
     * Returns a new Dinero object that represents the sum of this and an other Dinero object.
     *
     * If Dinero objects have a different `precision`, they will be first converted to the highest.
     *
     * @param {Dinero} addend - The Dinero object to add.
     *
     * @example
     * // returns a Dinero object with amount 600
     * Dinero({ amount: 400 }).add(Dinero({ amount: 200 }))
     * @example
     * // returns a Dinero object with amount 144545 and precision 4
     * Dinero({ amount: 400 }).add(Dinero({ amount: 104545, precision: 4 }))
     *
     * @throws {TypeError} If `addend` has a different currency.
     *
     * @return {Dinero}
     */
    add: function add(addend) {
      assertSameCurrency.call(this, addend);
      var addends = Dinero.normalizePrecision([this, addend]);
      return create.call(this, {
        amount: calculator$1.add(addends[0].getAmount(), addends[1].getAmount()),
        precision: addends[0].getPrecision()
      });
    },

    /**
     * Returns a new Dinero object that represents the difference of this and an other Dinero object.
     *
     * If Dinero objects have a different `precision`, they will be first converted to the highest.
     *
     * @param  {Dinero} subtrahend - The Dinero object to subtract.
     *
     * @example
     * // returns a Dinero object with amount 200
     * Dinero({ amount: 400 }).subtract(Dinero({ amount: 200 }))
     * @example
     * // returns a Dinero object with amount 64545 and precision 4
     * Dinero({ amount: 104545, precision: 4 }).subtract(Dinero({ amount: 400 }))
     *
     * @throws {TypeError} If `subtrahend` has a different currency.
     *
     * @return {Dinero}
     */
    subtract: function subtract(subtrahend) {
      assertSameCurrency.call(this, subtrahend);
      var subtrahends = Dinero.normalizePrecision([this, subtrahend]);
      return create.call(this, {
        amount: calculator$1.subtract(subtrahends[0].getAmount(), subtrahends[1].getAmount()),
        precision: subtrahends[0].getPrecision()
      });
    },

    /**
     * Returns a new Dinero object that represents the multiplied value by the given factor.
     *
     * By default, fractional minor currency units are rounded using the **half to even** rule ([banker's rounding](http://wiki.c2.com/?BankersRounding)).
     *
     * Rounding *can* lead to accuracy issues as you chain many times. Consider a minimal amount of subsequent calculations for safer results.
     * You can also specify a different `roundingMode` to better fit your needs.
     *
     * @param  {Number} multiplier - The factor to multiply by.
     * @param  {String} [roundingMode='HALF_EVEN'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @example
     * // returns a Dinero object with amount 1600
     * Dinero({ amount: 400 }).multiply(4)
     * @example
     * // returns a Dinero object with amount 800
     * Dinero({ amount: 400 }).multiply(2.001)
     * @example
     * // returns a Dinero object with amount 801
     * Dinero({ amount: 400 }).multiply(2.00125, 'HALF_UP')
     *
     * @return {Dinero}
     */
    multiply: function multiply(multiplier) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalRoundingMode;
      return create.call(this, {
        amount: calculator$1.round(calculator$1.multiply(this.getAmount(), multiplier), roundingMode)
      });
    },

    /**
     * Returns a new Dinero object that represents the divided value by the given factor.
     *
     * By default, fractional minor currency units are rounded using the **half to even** rule ([banker's rounding](http://wiki.c2.com/?BankersRounding)).
     *
     * Rounding *can* lead to accuracy issues as you chain many times. Consider a minimal amount of subsequent calculations for safer results.
     * You can also specify a different `roundingMode` to better fit your needs.
     *
     * As rounding is applied, precision may be lost in the process. If you want to accurately split a Dinero object, use {@link module:Dinero~allocate allocate} instead.
     *
     * @param  {Number} divisor - The factor to divide by.
     * @param  {String} [roundingMode='HALF_EVEN'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @example
     * // returns a Dinero object with amount 100
     * Dinero({ amount: 400 }).divide(4)
     * @example
     * // returns a Dinero object with amount 52
     * Dinero({ amount: 105 }).divide(2)
     * @example
     * // returns a Dinero object with amount 53
     * Dinero({ amount: 105 }).divide(2, 'HALF_UP')
     *
     * @return {Dinero}
     */
    divide: function divide(divisor) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalRoundingMode;
      return create.call(this, {
        amount: calculator$1.round(calculator$1.divide(this.getAmount(), divisor), roundingMode)
      });
    },

    /**
     * Returns a new Dinero object that represents a percentage of this.
     *
     * As rounding is applied, precision may be lost in the process. If you want to accurately split a Dinero object, use {@link module:Dinero~allocate allocate} instead.
     *
     * @param  {Number} percentage - The percentage to extract (between 0 and 100).
     *
     * @example
     * // returns a Dinero object with amount 5000
     * Dinero({ amount: 10000 }).percentage(50)
     *
     * @throws {RangeError} If `percentage` is out of range.
     *
     * @return {Dinero}
     */
    percentage: function percentage(_percentage) {
      assertPercentage(_percentage);
      return this.multiply(calculator$1.divide(_percentage, 100));
    },

    /**
     * Allocates the amount of a Dinero object according to a list of ratios.
     *
     * Sometimes you need to split monetary values but percentages can't cut it without adding or losing pennies.
     * A good example is invoicing: let's say you need to bill $1,000.03 and you want a 50% downpayment.
     * If you use {@link module:Dinero~percentage percentage}, you'll get an accurate Dinero object but the amount won't be billable: you can't split a penny.
     * If you round it, you'll bill a penny extra.
     * With {@link module:Dinero~allocate allocate}, you can split a monetary amount then distribute the remainder as evenly as possible.
     *
     * You can use percentage style or ratio style for `ratios`: `[25, 75]` and `[1, 3]` will do the same thing.
     *
     * Since v1.8.0, you can use zero ratios (such as [0, 50, 50]). If there's a remainder to distribute, zero ratios are skipped and return a Dinero object with amount zero.
     *
     * @param  {Number[]} ratios - The ratios to allocate the money to.
     *
     * @example
     * // returns an array of two Dinero objects
     * // the first one with an amount of 502
     * // the second one with an amount of 501
     * Dinero({ amount: 1003 }).allocate([50, 50])
     * @example
     * // returns an array of two Dinero objects
     * // the first one with an amount of 25
     * // the second one with an amount of 75
     * Dinero({ amount: 100 }).allocate([1, 3])
     * @example
     * // since version 1.8.0
     * // returns an array of three Dinero objects
     * // the first one with an amount of 0
     * // the second one with an amount of 502
     * // the third one with an amount of 501
     * Dinero({ amount: 1003 }).allocate([0, 50, 50])
     *
     * @throws {TypeError} If ratios are invalid.
     *
     * @return {Dinero[]}
     */
    allocate: function allocate(ratios) {
      var _this = this;

      assertValidRatios(ratios);
      var total = ratios.reduce(function (a, b) {
        return calculator$1.add(a, b);
      });
      var remainder = this.getAmount();
      var shares = ratios.map(function (ratio) {
        var share = Math.floor(calculator$1.divide(calculator$1.multiply(_this.getAmount(), ratio), total));
        remainder = calculator$1.subtract(remainder, share);
        return create.call(_this, {
          amount: share
        });
      });
      var i = 0;

      while (remainder > 0) {
        if (ratios[i] > 0) {
          shares[i] = shares[i].add(create.call(this, {
            amount: 1
          }));
          remainder = calculator$1.subtract(remainder, 1);
        }

        i += 1;
      }

      return shares;
    },

    /**
     * Returns a Promise containing a new Dinero object converted to another currency.
     *
     * You have two options to provide the exchange rates:
     *
     * 1. **Use an exchange rate REST API, and let Dinero handle the fetching and conversion.**
     *   This is a simple option if you have access to an exchange rate REST API and want Dinero to do the rest.
     * 2. **Fetch the exchange rates on your own and provide them directly.**
     *   This is useful if you're fetching your rates from somewhere else (a file, a database), use a different protocol or query language than REST (SOAP, GraphQL) or want to fetch rates once and cache them instead of making new requests every time.
     *
     * **If you want to use a REST API**, you must provide a third-party endpoint yourself. Dinero doesn't come bundled with an exchange rates endpoint.
     *
     * Here are some exchange rate APIs you can use:
     *
     * * [Fixer](https://fixer.io)
     * * [Open Exchange Rates](https://openexchangerates.org)
     * * [Coinbase](https://api.coinbase.com/v2/exchange-rates)
     * * More [foreign](https://github.com/toddmotto/public-apis#currency-exchange) and [crypto](https://github.com/toddmotto/public-apis#cryptocurrency) exchange rate APIs.
     *
     * **If you want to fetch your own rates and provide them directly**, you need to pass a promise that resolves to the exchanges rates.
     *
     * In both cases, you need to specify at least:
     *
     * * a **destination currency**: the currency in which you want to convert your Dinero object. You can specify it with `currency`.
     * * an **endpoint**: the API URL to query exchange rates, with parameters, or a promise that resolves to the exchange rates. You can specify it with `options.endpoint`.
     * * a **property path**: the path to access the wanted rate in your API's JSON response (or the custom promise's payload). For example, with a response of:
     * ```json
     * {
     *     "data": {
     *       "base": "USD",
     *       "destination": "EUR",
     *       "rate": "0.827728919"
     *     }
     * }
     * ```
     * Then the property path is `'data.rate'`. You can specify it with `options.propertyPath`.
     *
     * The base currency (the one of your Dinero object) and the destination currency can be used as "merge tags" with the mustache syntax, respectively `{{from}}` and `{{to}}`.
     * You can use these tags to refer to these values in `options.endpoint` and `options.propertyPath`.
     *
     * For example, if you need to specify the base currency as a query parameter, you can do the following:
     *
     * ```js
     * {
     *   endpoint: 'https://yourexchangerates.api/latest?base={{from}}'
     * }
     * ```
     *
     * @param  {String} currency - The destination currency, expressed as an {@link https://en.wikipedia.org/wiki/ISO_4217#Active_codes ISO 4217 currency code}.
     * @param  {(String|Promise)} options.endpoint - The API endpoint to retrieve exchange rates. You can substitute this with a promise that resolves to the exchanges rates if you already have them.
     * @param  {String} [options.propertyPath='rates.{{to}}'] - The property path to the rate.
     * @param  {Object} [options.headers] - The HTTP headers to provide, if needed.
     * @param  {String} [options.roundingMode='HALF_EVEN'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @example
     * // your global API parameters
     * Dinero.globalExchangeRatesApi = { ... }
     *
     * // returns a Promise containing a Dinero object with the destination currency
     * // and the initial amount converted to the new currency.
     * Dinero({ amount: 500 }).convert('EUR')
     * @example
     * // returns a Promise containing a Dinero object,
     * // with specific API parameters and rounding mode for this specific instance.
     * Dinero({ amount: 500 })
     *   .convert('XBT', {
     *     endpoint: 'https://yourexchangerates.api/latest?base={{from}}',
     *     propertyPath: 'data.rates.{{to}}',
     *     headers: {
     *       'user-key': 'xxxxxxxxx'
     *     },
     *     roundingMode: 'HALF_UP'
     *   })
     * @example
     * // usage with exchange rates provided as a custom promise
     * // using the default `propertyPath` format (so it doesn't have to be specified)
     * const rates = {
     *   rates: {
     *     EUR: 0.81162
     *   }
     * }
     *
     * Dinero({ amount: 500 })
     *   .convert('EUR', {
     *     endpoint: new Promise(resolve => resolve(rates))
     *   })
     * @example
     * // usage with Promise.prototype.then and Promise.prototype.catch
     * Dinero({ amount: 500 })
     *   .convert('EUR')
     *   .then(dinero => {
     *     dinero.getCurrency() // returns 'EUR'
     *   })
     *   .catch(err => {
     *     // handle errors
     *   })
     * @example
     * // usage with async/await
     * (async () => {
     *   const price = await Dinero({ amount: 500 }).convert('EUR')
     *   price.getCurrency() // returns 'EUR'
     * })()
     *
     * @return {Promise}
     */
    convert: function convert(currency) {
      var _this2 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$endpoint = _ref.endpoint,
          endpoint = _ref$endpoint === void 0 ? globalExchangeRatesApi.endpoint : _ref$endpoint,
          _ref$propertyPath = _ref.propertyPath,
          propertyPath = _ref$propertyPath === void 0 ? globalExchangeRatesApi.propertyPath || 'rates.{{to}}' : _ref$propertyPath,
          _ref$headers = _ref.headers,
          headers = _ref$headers === void 0 ? globalExchangeRatesApi.headers : _ref$headers,
          _ref$roundingMode = _ref.roundingMode,
          roundingMode = _ref$roundingMode === void 0 ? globalRoundingMode : _ref$roundingMode;

      var options = Object.assign({}, {
        endpoint: endpoint,
        propertyPath: propertyPath,
        headers: headers,
        roundingMode: roundingMode
      });
      return CurrencyConverter(options).getExchangeRate(this.getCurrency(), currency).then(function (rate) {
        assert(!isUndefined(rate), "No rate was found for the destination currency \"".concat(currency, "\"."), TypeError);
        return create.call(_this2, {
          amount: calculator$1.round(calculator$1.multiply(_this2.getAmount(), parseFloat(rate)), options.roundingMode),
          currency: currency
        });
      });
    },

    /**
     * Checks whether the value represented by this object equals to the other.
     *
     * @param  {Dinero} comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 500, currency: 'EUR' }).equalsTo(Dinero({ amount: 500, currency: 'EUR' }))
     * @example
     * // returns false
     * Dinero({ amount: 500, currency: 'EUR' }).equalsTo(Dinero({ amount: 800, currency: 'EUR' }))
     * @example
     * // returns false
     * Dinero({ amount: 500, currency: 'USD' }).equalsTo(Dinero({ amount: 500, currency: 'EUR' }))
     * @example
     * // returns false
     * Dinero({ amount: 500, currency: 'USD' }).equalsTo(Dinero({ amount: 800, currency: 'EUR' }))
     * @example
     * // returns true
     * Dinero({ amount: 1000, currency: 'EUR', precision: 2 }).equalsTo(Dinero({ amount: 10000, currency: 'EUR', precision: 3 }))
     * @example
     * // returns false
     * Dinero({ amount: 10000, currency: 'EUR', precision: 2 }).equalsTo(Dinero({ amount: 10000, currency: 'EUR', precision: 3 }))
     *
     * @return {Boolean}
     */
    equalsTo: function equalsTo(comparator) {
      return this.hasSameAmount(comparator) && this.hasSameCurrency(comparator);
    },

    /**
     * Checks whether the value represented by this object is less than the other.
     *
     * @param  {Dinero} comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 500 }).lessThan(Dinero({ amount: 800 }))
     * @example
     * // returns false
     * Dinero({ amount: 800 }).lessThan(Dinero({ amount: 500 }))
     * @example
     * // returns true
     * Dinero({ amount: 5000, precision: 3 }).lessThan(Dinero({ amount: 800 }))
     * @example
     * // returns false
     * Dinero({ amount: 800 }).lessThan(Dinero({ amount: 5000, precision: 3 }))
     *
     * @throws {TypeError} If `comparator` has a different currency.
     *
     * @return {Boolean}
     */
    lessThan: function lessThan(comparator) {
      assertSameCurrency.call(this, comparator);
      var comparators = Dinero.normalizePrecision([this, comparator]);
      return comparators[0].getAmount() < comparators[1].getAmount();
    },

    /**
     * Checks whether the value represented by this object is less than or equal to the other.
     *
     * @param  {Dinero} comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 800 }))
     * @example
     * // returns true
     * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 500 }))
     * @example
     * // returns false
     * Dinero({ amount: 500 }).lessThanOrEqual(Dinero({ amount: 300 }))
     * @example
     * // returns true
     * Dinero({ amount: 5000, precision: 3 }).lessThanOrEqual(Dinero({ amount: 800 }))
     * @example
     * // returns true
     * Dinero({ amount: 5000, precision: 3 }).lessThanOrEqual(Dinero({ amount: 500 }))
     * @example
     * // returns false
     * Dinero({ amount: 800 }).lessThanOrEqual(Dinero({ amount: 5000, precision: 3 }))
     *
     * @throws {TypeError} If `comparator` has a different currency.
     *
     * @return {Boolean}
     */
    lessThanOrEqual: function lessThanOrEqual(comparator) {
      assertSameCurrency.call(this, comparator);
      var comparators = Dinero.normalizePrecision([this, comparator]);
      return comparators[0].getAmount() <= comparators[1].getAmount();
    },

    /**
     * Checks whether the value represented by this object is greater than the other.
     *
     * @param  {Dinero} comparator - The Dinero object to compare to.
     *
     * @example
     * // returns false
     * Dinero({ amount: 500 }).greaterThan(Dinero({ amount: 800 }))
     * @example
     * // returns true
     * Dinero({ amount: 800 }).greaterThan(Dinero({ amount: 500 }))
     * @example
     * // returns true
     * Dinero({ amount: 800 }).greaterThan(Dinero({ amount: 5000, precision: 3 }))
     * @example
     * // returns false
     * Dinero({ amount: 5000, precision: 3 }).greaterThan(Dinero({ amount: 800 }))
     *
     * @throws {TypeError} If `comparator` has a different currency.
     *
     * @return {Boolean}
     */
    greaterThan: function greaterThan(comparator) {
      assertSameCurrency.call(this, comparator);
      var comparators = Dinero.normalizePrecision([this, comparator]);
      return comparators[0].getAmount() > comparators[1].getAmount();
    },

    /**
     * Checks whether the value represented by this object is greater than or equal to the other.
     *
     * @param  {Dinero} comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 300 }))
     * @example
     * // returns true
     * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 500 }))
     * @example
     * // returns false
     * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 800 }))
     * @example
     * // returns true
     * Dinero({ amount: 800 }).greaterThanOrEqual(Dinero({ amount: 5000, precision: 3 }))
     * @example
     * // returns true
     * Dinero({ amount: 500 }).greaterThanOrEqual(Dinero({ amount: 5000, precision: 3 }))
     * @example
     * // returns false
     * Dinero({ amount: 5000, precision: 3 }).greaterThanOrEqual(Dinero({ amount: 800 }))
     *
     * @throws {TypeError} If `comparator` has a different currency.
     *
     * @return {Boolean}
     */
    greaterThanOrEqual: function greaterThanOrEqual(comparator) {
      assertSameCurrency.call(this, comparator);
      var comparators = Dinero.normalizePrecision([this, comparator]);
      return comparators[0].getAmount() >= comparators[1].getAmount();
    },

    /**
     * Checks if the value represented by this object is zero.
     *
     * @example
     * // returns true
     * Dinero({ amount: 0 }).isZero()
     * @example
     * // returns false
     * Dinero({ amount: 100 }).isZero()
     *
     * @return {Boolean}
     */
    isZero: function isZero() {
      return this.getAmount() === 0;
    },

    /**
     * Checks if the value represented by this object is positive.
     *
     * @example
     * // returns false
     * Dinero({ amount: -10 }).isPositive()
     * @example
     * // returns true
     * Dinero({ amount: 10 }).isPositive()
     * @example
     * // returns true
     * Dinero({ amount: 0 }).isPositive()
     *
     * @return {Boolean}
     */
    isPositive: function isPositive() {
      return this.getAmount() >= 0;
    },

    /**
     * Checks if the value represented by this object is negative.
     *
     * @example
     * // returns true
     * Dinero({ amount: -10 }).isNegative()
     * @example
     * // returns false
     * Dinero({ amount: 10 }).isNegative()
     * @example
     * // returns false
     * Dinero({ amount: 0 }).isNegative()
     *
     * @return {Boolean}
     */
    isNegative: function isNegative() {
      return this.getAmount() < 0;
    },

    /**
     * Checks if this has minor currency units.
     * Deprecates {@link module:Dinero~hasCents hasCents}.
     *
     * @example
     * // returns false
     * Dinero({ amount: 1100 }).hasSubUnits()
     * @example
     * // returns true
     * Dinero({ amount: 1150 }).hasSubUnits()
     *
     * @return {Boolean}
     */
    hasSubUnits: function hasSubUnits() {
      return calculator$1.modulo(this.getAmount(), Math.pow(10, precision)) !== 0;
    },

    /**
     * Checks if this has minor currency units.
     *
     * @deprecated since version 1.4.0, will be removed in 2.0.0
     * Use {@link module:Dinero~hasSubUnits hasSubUnits} instead.
     *
     * @example
     * // returns false
     * Dinero({ amount: 1100 }).hasCents()
     * @example
     * // returns true
     * Dinero({ amount: 1150 }).hasCents()
     *
     * @return {Boolean}
     */
    hasCents: function hasCents() {
      return calculator$1.modulo(this.getAmount(), Math.pow(10, precision)) !== 0;
    },

    /**
     * Checks whether the currency represented by this object equals to the other.
     *
     * @param  {Dinero}  comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 2000, currency: 'EUR' }).hasSameCurrency(Dinero({ amount: 1000, currency: 'EUR' }))
     * @example
     * // returns false
     * Dinero({ amount: 1000, currency: 'EUR' }).hasSameCurrency(Dinero({ amount: 1000, currency: 'USD' }))
     *
     * @return {Boolean}
     */
    hasSameCurrency: function hasSameCurrency(comparator) {
      return this.getCurrency() === comparator.getCurrency();
    },

    /**
     * Checks whether the amount represented by this object equals to the other.
     *
     * @param  {Dinero}  comparator - The Dinero object to compare to.
     *
     * @example
     * // returns true
     * Dinero({ amount: 1000, currency: 'EUR' }).hasSameAmount(Dinero({ amount: 1000 }))
     * @example
     * // returns false
     * Dinero({ amount: 2000, currency: 'EUR' }).hasSameAmount(Dinero({ amount: 1000, currency: 'EUR' }))
     * @example
     * // returns true
     * Dinero({ amount: 1000, currency: 'EUR', precision: 2 }).hasSameAmount(Dinero({ amount: 10000, precision: 3 }))
     * @example
     * // returns false
     * Dinero({ amount: 10000, currency: 'EUR', precision: 2 }).hasSameAmount(Dinero({ amount: 10000, precision: 3 }))
     *
     * @return {Boolean}
     */
    hasSameAmount: function hasSameAmount(comparator) {
      var comparators = Dinero.normalizePrecision([this, comparator]);
      return comparators[0].getAmount() === comparators[1].getAmount();
    },

    /**
     * Returns this object formatted as a string.
     *
     * The format is a mask which defines how the output string will be formatted.
     * It defines whether to display a currency, in what format, how many fraction digits to display and whether to use grouping separators.
     * The output is formatted according to the applying locale.
     *
     * Object                       | Format            | String
     * :--------------------------- | :---------------- | :---
     * `Dinero({ amount: 500050 })` | `'$0,0.00'`       | $5,000.50
     * `Dinero({ amount: 500050 })` | `'$0,0'`          | $5,001
     * `Dinero({ amount: 500050 })` | `'$0'`            | $5001
     * `Dinero({ amount: 500050 })` | `'$0.0'`          | $5000.5
     * `Dinero({ amount: 500050 })` | `'USD0,0.0'`      | USD5,000.5
     * `Dinero({ amount: 500050 })` | `'0,0.0 dollar'`  | 5,000.5 dollars
     *
     * Don't try to substitute the `$` sign or the `USD` code with your target currency, nor adapt the format string to the exact format you want.
     * The format is a mask which defines a pattern and returns a valid, localized currency string.
     * If you want to display the object in a custom way, either use {@link module:Dinero~getAmount getAmount}, {@link module:Dinero~toUnit toUnit} or {@link module:Dinero~toRoundedUnit toRoundedUnit} and manipulate the output string as you wish.
     *
     * {@link module:Dinero~toFormat toFormat} wraps around `Number.prototype.toLocaleString`. For that reason, **format will vary depending on how it's implemented in the end user's environment**.
     *
     * You can also use `toLocaleString` directly:
     * `Dinero().toRoundedUnit(digits, roundingMode).toLocaleString(locale, options)`.
     *
     * By default, amounts are rounded using the **half away from zero** rule ([commercial rounding](https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero)).
     * You can also specify a different `roundingMode` to better fit your needs.
     *
     * @param  {String} [format='$0,0.00'] - The format mask to format to.
     * @param  {String} [roundingMode='HALF_AWAY_FROM_ZERO'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @example
     * // returns $2,000
     * Dinero({ amount: 200000 }).toFormat('$0,0')
     * @example
     * // returns €50.5
     * Dinero({ amount: 5050, currency: 'EUR' }).toFormat('$0,0.0')
     * @example
     * // returns 100 euros
     * Dinero({ amount: 10000, currency: 'EUR' }).setLocale('fr-FR').toFormat('0,0 dollar')
     * @example
     * // returns 2000
     * Dinero({ amount: 200000, currency: 'EUR' }).toFormat()
     * @example
     * // returns $10
     * Dinero({ amount: 1050 }).toFormat('$0', 'HALF_EVEN')
     *
     * @return {String}
     */
    toFormat: function toFormat() {
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : globalFormat;
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalFormatRoundingMode;
      var formatter = Format(format);
      return this.toRoundedUnit(formatter.getMinimumFractionDigits(), roundingMode).toLocaleString(this.getLocale(), {
        currencyDisplay: formatter.getCurrencyDisplay(),
        useGrouping: formatter.getUseGrouping(),
        minimumFractionDigits: formatter.getMinimumFractionDigits(),
        style: formatter.getStyle(),
        currency: this.getCurrency()
      });
    },

    /**
     * Returns the amount represented by this object in units.
     *
     * @example
     * // returns 10.5
     * Dinero({ amount: 1050 }).toUnit()
     * @example
     * // returns 10.545
     * Dinero({ amount: 10545, precision: 3 }).toUnit()
     *
     * @return {Number}
     */
    toUnit: function toUnit() {
      return calculator$1.divide(this.getAmount(), Math.pow(10, precision));
    },

    /**
     * Returns the amount represented by this object in rounded units.
     *
     * By default, the method uses the **half away from zero** rule ([commercial rounding](https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero)).
     * You can also specify a different `roundingMode` to better fit your needs.
     *
     * @example
     * // returns 10.6
     * Dinero({ amount: 1055 }).toRoundedUnit(1)
     * @example
     * // returns 10
     * Dinero({ amount: 1050 }).toRoundedUnit(0, 'HALF_EVEN')
     *
     * @param  {Number} digits - The number of fraction digits to round to.
     * @param  {String} [roundingMode='HALF_AWAY_FROM_ZERO'] - The rounding mode to use: `'HALF_ODD'`, `'HALF_EVEN'`, `'HALF_UP'`, `'HALF_DOWN'`, `'HALF_TOWARDS_ZERO'`, `'HALF_AWAY_FROM_ZERO'` or `'DOWN'`.
     *
     * @return {Number}
     */
    toRoundedUnit: function toRoundedUnit(digits) {
      var roundingMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalFormatRoundingMode;
      var factor = Math.pow(10, digits);
      return calculator$1.divide(calculator$1.round(calculator$1.multiply(this.toUnit(), factor), roundingMode), factor);
    },

    /**
     * Returns the object's data as an object literal.
     *
     * @example
     * // returns { amount: 500, currency: 'EUR', precision: 2 }
     * Dinero({ amount: 500, currency: 'EUR', precision: 2 }).toObject()
     *
     * @return {Object}
     */
    toObject: function toObject() {
      return {
        amount: amount,
        currency: currency,
        precision: precision
      };
    },

    /**
     * Returns the object's data as an object literal.
     *
     * Alias of {@link module:Dinero~toObject toObject}.
     * It is defined so that calling `JSON.stringify` on a Dinero object will automatically extract the relevant data.
     *
     * @example
     * // returns '{"amount":500,"currency":"EUR","precision":2}'
     * JSON.stringify(Dinero({ amount: 500, currency: 'EUR', precision: 2 }))
     *
     * @return {Object}
     */
    toJSON: function toJSON() {
      return this.toObject();
    }
  };
};

var dinero = Object.assign(Dinero, Defaults, Globals, Static);

module.exports = dinero;

},{}]},{},[11]);
