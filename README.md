# bootstrap-form-buttonset

A plugin to replace checkbox and/or radio inputs with Bootstrap button groups. The inputs will stay active in the
background and can be submitted anytime without extra scripting.

Works with **Bootstrap 2** and **Bootstrap 3**!

### Demo

[Bootstrap2](http://akger1379.github.io/bootstrap-form-buttonset/demo-bs2.html)

[Bootstrap3](http://akger1379.github.io/bootstrap-form-buttonset/demo-bs3.html)

### Usage

First define your inputs and wrap them inside a container.

**Important** - all inputs need to have their own unique id!

```html
<div class="my-container">
	<input type="radio" name="answer" id="answer1" value="yes"><label for="answer1">Yes</label>
	<input type="radio" name="answer" id="answer2" value="no"><label for="answer1">No</label>
</div>
```

To activate the plugin just call ```$('.my-container').bsFormButtonset('attach');```.