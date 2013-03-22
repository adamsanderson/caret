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
  events.bind(el, "keyup", checkCaretPosition);
  events.bind(el, "mouseup", checkCaretPosition);

  var caret = this;
  function checkCaretPosition(){
    caret.emit("change");
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
};

Caret.prototype.moveBefore = function(element){
  if (document.getSelection){
    this.el.focus();
    var range = document.createRange();
    range.setStartBefore(element);
    range.collapse(true); // Collapse to Start
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    var range = document.body.createTextRange();
    var marker = createMarker();
    var parent = element.parentElement
    insertBefore(parent, marker, element);
    range.moveToElementText(marker);
    range.collapse(true); // Collapse to Start
    range.select();
    parent.removeChild(marker);
  }
};

Caret.prototype.moveAfter = function(element){
  if (document.getSelection){
    this.el.focus();
    if (!element.childNodes[element.childNodes.length - 1].nodeType !== TEXT_NODE){
      element.appendChild(document.createTextNode(""));
    }
    var range = document.createRange();
    range.setEndAfter(element);
    range.collapse(false); // Collapse to End
    var selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    var range = document.body.createTextRange();
    var marker = createMarker();
    var parent = element.parentElement
    insertAfter(parent, marker, element);
    range.moveToElementText(marker);
    range.collapse(false); // Collapse to End
    range.select();
    parent.removeChild(marker);
  }
};

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
  console.log(el)
  console.log(newChild)
  console.log(refChild)
  return el.insertBefore(newChild, refChild);
}

function insertAfter(el, newChild, refChild) {
  return insertBefore(el, newChild, refChild.nextSibling);
}