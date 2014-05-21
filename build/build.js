/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

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

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
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
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
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
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
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
    , callbacks = this._callbacks[event];

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
  return this._callbacks[event] || [];
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

});
require.register("component-event/index.js", function(module, exports, require){

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
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
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
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("caret/index.js", function(module, exports, require){
var Emitter = require('emitter');
var events = require('event');

var ELEMENT_NODE = document.ELEMENT_NODE;
var TEXT_NODE    = document.TEXT_NODE;

var BEFORE = {};
var AFTER  = {};

module.exports = Caret;

function Caret(el) {
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
  
  if (node.nodeType == ELEMENT_NODE){
    return '';
  }
  
  if (direction === BEFORE){
    return node.substringData(0, offset); 
  } else {
    return node.substringData(offset, node.length-1); 
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
});
require.alias("component-emitter/index.js", "caret/deps/emitter/index.js");

require.alias("component-event/index.js", "caret/deps/event/index.js");
