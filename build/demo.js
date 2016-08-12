(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Caret  = require('./index.js');
var events = require('component-event');

var el     = document.getElementById('content');
var before = document.getElementById('text-before');
var after  = document.getElementById('text-after');
var tag    = document.getElementById('current-tag');
var caret  = new Caret(el);

caret.on('change', function(){
  var lastParent = document.querySelector('.parent-element');
  var currentParent = this.parentElement();
  
  if (lastParent != currentParent){
    tag.textContent = tag.innerText = currentParent.tagName;
  }
  
  before.textContent = before.innerText = caret.textBefore();
  after.textContent  = after.innerText  = caret.textAfter();        
});

events.bind(document.getElementById('move-to-start'), 'click', function(){
  caret.moveToStart();
});

events.bind(document.getElementById('move-to-end'), 'click', function(){
  caret.moveToEnd();
});

events.bind(document.getElementById('move-before'), 'click', function(){
  caret.moveBefore(getRelativeDemoItem());
});

events.bind(document.getElementById('move-after'), 'click', function(){
  caret.moveAfter(getRelativeDemoItem());
});

// For the moment, pick a relative item to demo against:
function getRelativeDemoItem(){
  var el = document.getElementsByTagName('code')[0];
  if (!el) {
    el = document.createElement('code');
    el.textContent = el.innerText = "Hey you deleted the code element, here's a new one."
    content.appendChild(el);
  }
  
  return el;
}
},{"./index.js":2,"component-event":4}],2:[function(require,module,exports){
var Emitter = require('emitter');
var events = require('event');

var ELEMENT_NODE = document.ELEMENT_NODE;
var TEXT_NODE    = document.TEXT_NODE;

var BEFORE = {};
var AFTER  = {};

module.exports = Caret;

function Caret(el) {
  if (!(this instanceof Caret)) return new Caret(el);
  this.el = el || document.body;
  this.bind(el);
}

Emitter(Caret.prototype);

Caret.prototype.bind = function(el) {
  var caret = this;
  events.bind(el, "keyup", checkCaretPosition);
  events.bind(el, "mouseup", checkCaretPosition);

  function checkCaretPosition(){
    caret.moved();
  }
};

Caret.prototype.parentElement = function(){
  var node;

  if (document.getSelection){
    node = document.getSelection().focusNode;
    return node.nodeType == ELEMENT_NODE ? node : node.parentElement;
  } else {
    return document.selection.createRange().parentElement();
  }
};

/**
  Returns text before the caret within the current element.
*/
Caret.prototype.textBefore = function(){
  if (document.getSelection){
    return getText(BEFORE);
  } else {
    return getIeText(BEFORE);
  }
};

/**
  Returns text after the caret within the current element.
*/
Caret.prototype.textAfter = function(){
  if (document.getSelection){
    return getText(AFTER);
  } else {
    return getIeText(AFTER);
  }
};

Caret.prototype.moveToStart = function(){
  if (document.getSelection){
    this.el.focus();
    document.getSelection().collapse(this.el,true);
  } else {
    var range = document.body.createTextRange();
    range.moveToElementText(this.el);
    range.collapse(true); // Collapse to Start
    range.select();
  }
  this.moved();
};

Caret.prototype.moveToEnd = function(){
  if (document.getSelection){
    this.el.focus();
    // Firefox will not select the end of the element if the last element is not a text node
    // http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
    if (!this.el.childNodes[this.el.childNodes.length - 1].nodeType !== TEXT_NODE){
      this.el.appendChild(document.createTextNode(""));
    }
    var selection = document.getSelection();
    selection.selectAllChildren(this.el);
    selection.collapseToEnd();
  } else {
    var range = document.body.createTextRange();
    range.moveToElementText(this.el);
    range.collapse(false); // Collapse to End
    range.select();
  }
  this.moved();
};

Caret.prototype.moveBefore = function(element){
  if (document.getSelection){
    this.el.focus();
    moveRelative(element, BEFORE);
  } else {
    moveIeRelative(element, BEFORE);
  }
  this.moved();
};

Caret.prototype.moveAfter = function(element){
  if (document.getSelection){
    this.el.focus();
    moveRelative(element, AFTER);
  } else {
    moveIeRelative(element, AFTER);
  }
  this.moved();
};

Caret.prototype.moved = function(){
  this.emit("change");
}

function getText(direction){
  var selection = document.getSelection();
  var node      = selection.focusNode;
  var offset    = selection.focusOffset;
  var startIndex, endIndex;

  if (direction === BEFORE) {
    startIndex = 0;
    endIndex = offset;
  } else {
    startIndex = offset;
    endIndex = node.length - 1;
  }

  if (node.nodeType === TEXT_NODE) {
    return node.substringData(startIndex, endIndex);
  } else {
    // Firefox may return elements, also empty elements will not have a text node.
    return node.textContent.substr(startIndex, endIndex);
  }
}

function getIeText(direction){
  var range = document.selection.createRange();
  var parent = range.parentElement();
  var i = 0;

  if (direction === BEFORE){
    while (range.move('character',-1) && parent == range.parentElement()){ i++; }
    range.move('character',1);
    range.moveEnd('character',i);
  } else {
    while (range.move('character', 1) && parent == range.parentElement()){ i--; }
    range.move('character', -1);
    range.moveStart('character',i);
  }

  return range.text;
}

function moveRelative(element, direction){
  var range = document.createRange();
  if (direction === BEFORE){
    range.setStartBefore(element);
    range.collapse(true); // Collapse to Start
  } else {
    range.setEndAfter(element);
    range.collapse(false); // Collapse to End
  }
  var selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function moveIeRelative(element, direction){
  var range = document.body.createTextRange();
  var marker = createMarker();
  var parent = element.parentElement;

  if (direction === BEFORE) {
    insertBefore(parent, marker, element);
    range.moveToElementText(marker);
    range.collapse(true); // Collapse to Start
  } else {
    insertAfter(parent, marker, element);
    range.moveToElementText(marker);
    range.collapse(false); // Collapse to End
  }

  range.select();
  parent.removeChild(marker);
}

// Create a random string by generating a large random number and then formatting it base 36.
function randomString(){
  return Math.floor((Math.random() * 18446744073709552000)).toString(36);
}

function createMarker(){
  var element = document.createElement('span');
  element.innerText = randomString();
  return element;
}

function insertBefore(el, newChild, refChild) {
  return el.insertBefore(newChild, refChild);
}

function insertAfter(el, newChild, refChild) {
  return insertBefore(el, newChild, refChild.nextSibling);
}

},{"emitter":3,"event":4}],3:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],4:[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}]},{},[1]);
