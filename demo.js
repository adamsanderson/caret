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