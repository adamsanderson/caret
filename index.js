var Emitter = require('emitter');
var events = require('event');
var ELEMENT_NODE = document.ELEMENT_NODE;

module.exports = Caret;


// var caret = new Caret(getElementById('content'))
// var el = caret.parentElement();
// var text = caret.precedingText();
// var text = caret.followingText();

function Caret(el) {
  this.el = el || document;
  this.bind(el);
}

Emitter(Caret.prototype);

Caret.prototype.bind = function(el) {
  events.bind(el, "keyup", checkCaretPosition);
  events.bind(el, "mouseup", checkCaretPosition);

  var caret = this;
  function checkCaretPosition(){
    // TODO: Only trigger events on real changes
    caret.emit("change");
  }
};

Caret.prototype.parentElement = function(){
  var node;
  
  if (document.getSelection){
    node = document.getSelection().focusNode;
  } else {
    node = document.selection.createRange().parentElement();
  }
  
  return node.nodeType == ELEMENT_NODE ? node : node.parentElement;
};
