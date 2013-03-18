caret
=====

Listen to and inspect the browser caret.

View the [demo](http://adamsanderson.github.com/caret/) for an example of the information you can get.

This should work with IE8+ and all modern browsers.

Installation
------------

    $ component install adamsanderson/caret

API
---

**Caret(element)**: Create a new text caret observer.  If an `element` is defined, then only changes on that element will be reported.

**caret.on('change', fn)**: Listen for changes to the user's text caret.

**caret.parentElement()**: Returns the parent element containing the text caret.

**caret.textBefore()**: Returns the text before the caret within the current element.

**caret.textAfter()**: Returns the text after the caret within the current element.

Examples
--------

Watch for when the user starts editing a twitter handle (ie: @someone).

    var el = document.getElementById('content');
    var caret = new Caret(el);
    
    caret.on('change', function(){
      var text = this.textBefore();
      var match = text.match(/@(\w+)$/);
      
      if (match) {
        console.log("Editing user name:", match[1]);
      }
    });


License
-------

  MIT

---

Adam Sanderson, http://monkeyandcrow.com