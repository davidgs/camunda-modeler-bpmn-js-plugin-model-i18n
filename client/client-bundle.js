(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event'),
    domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query'),
    clear = require('min-dom/lib/clear');
const event = require('min-dom/lib/event');


// The default language
const defaultLanguage = "en";

//config key
const configKey = "modeli18n";

const defaultState = {
  currentLanguage: defaultLanguage,
  languages: ["en"],
  options: [{ value: "en", label: "English" }],
  languagesLoaded: false,
  selected: 'en'
};
function ModelI18NPlugin(elementRegistry, editorActions, canvas, modeling, eventBus) {
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;

  var self = this;

  this.state = defaultState;

  editorActions.register({
    generateLangs: function() {
      self.generateAndShow();
    },
    onChange: function(event) {
      self.onChange(event);
    }
  });

  ModelI18NPlugin.prototype.onChange = function (event) {
    event.preventDefault();
    self.renameIDs(event.target.value);
  }
  this.addRenameIDsContainer(canvas.getContainer().parentNode);

  eventBus.on('import.done', function () {
    self.addRenameIDsContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
  });
}

ModelI18NPlugin.prototype.generateAndShow = function() {
  this.generateLangs();
  this.showLangs();
};

ModelI18NPlugin.prototype.addRenameIDsContainer = function(container) {
  var self = this;
  var markup = '<div class="djs-popup dgs-model-i18n"> \
      <select class="id-list"></select> \
    </div>';
  this.element = domify(markup);

  container.appendChild(this.element);

  domEvent.bind(domQuery('.id-list', this.element), 'change', function (event) {
    self.onChange(event);
  });
};

ModelI18NPlugin.prototype.generateLangs = function () {
  var self = this;
  var langs = [];
  langs.push('en');
  var elements = this._elementRegistry._elements;
  const lang = "xml:lang";
  Object.keys(elements).forEach(function (key) {
    if (elements[key].type != 'label') {
      var businessObject = elements[key].element.businessObject;
      var en_name = elements[key].element.businessObject.name;
      if (businessObject.hasOwnProperty('extensionElements')) {
        if (businessObject.extensionElements.hasOwnProperty('values')) {
          var boo = Object.assign({}, businessObject.extensionElements.values[0]);
          boo.$body = en_name;
          boo[lang] = 'en';
          var hasEnglish = false;
          businessObject.extensionElements.values.forEach(function (value) {
            if (value.hasOwnProperty(lang)) {
              var labelLang = value[lang];
              if (labelLang == 'en') {
                hasEnglish = true;
              }
              if (!langs.includes(labelLang)) {
                langs.push(labelLang);
              }
            }
          });
          if (!hasEnglish) {
            businessObject.extensionElements.values.push(boo);
          }
        }
      }
    }
  });
  if (langs.length > 0) {
    this.state.languages = langs;
  }
};

ModelI18NPlugin.prototype.showLangs = function() {
  var self = this;
  var opts = [];
  var idList = domQuery('.id-list',this.element);
  clear(idList);
  let langs = this.state.languages;
  if (!langs.length > 0) {
    return;
  }
  if (langs != null && langs.length > 0) {
    for (var x = 0; x < langs.length; x++) {
      switch (langs[x]) {
        case "en":
          var lang = 'English';
          break;
        case "de":
          var lang = 'German';
          break;
        case "fr":
          var lang = 'French';
          break;
        case "es":
          var lang = 'Spanish';
          break;
        case "it":
          var lang = 'Italian';
          break;
        case "nl":
          var lang = 'Dutch';
          break;
        case "pt":
          var lang = 'Portuguese';
          break;
        case "ru":
          var lang = 'Russian';
          break;
        case "sv":
          var lang = 'Swedish';
          break;
        case "zh":
          var lang = 'Chinese';
          break;
        default:
          var lang = langs[x];
      }
      opts.push({ value: langs[x], label: lang });
    }
  }
  if (opts.length > 0) {
    for (var x = 0; x < opts.length; x++){
      var el = "<option value=" + opts[x].value + ">" + opts[x].label + "</option>"
      this.element = domify(el);

      idList.appendChild(this.element);
    }
    var ele = domQuery('.id-list');
    domEvent.bind(ele, 'change', function (event, value) {
      self.onChange(event, value);
    });
  }
  this.options = opts;
};

ModelI18NPlugin.prototype.renameIDs = function (id) {
  var self = this;
  var lang = id; //arguments[0];
  var elements = this._elementRegistry._elements;
  const langAttr = "xml:lang";
  Object.keys(elements).forEach(function (key) {
    if (elements[key].type != 'label') {
      var element = elements[key].element;
      var businessObject = elements[key].element.businessObject;
      if (businessObject.hasOwnProperty('extensionElements')) {
        var exts = businessObject.extensionElements;
        if (exts != null) {
          for (var z = 0; z < exts.values.length; z++) {
            if (exts.values[z].hasOwnProperty(langAttr)) {
              if (exts.values[z][langAttr] == lang) {
                var label = exts.values[z].$body;
                var props = {
                  name: label,
                }
                self._modeling.updateProperties(element, props);
              }
            }
          }
        }
      }
    }
  });
};


ModelI18NPlugin.$inject = [ 'elementRegistry', 'editorActions', 'canvas', 'modeling', 'eventBus' ];

module.exports = {
    __init__: ['modelI18NPlugin'],
    modelI18NPlugin: ['type', ModelI18NPlugin]
};

},{"min-dom/lib/classes":9,"min-dom/lib/clear":10,"min-dom/lib/domify":11,"min-dom/lib/event":12,"min-dom/lib/query":13}],2:[function(require,module,exports){
var registerBpmnJSPlugin = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;

var modelI18NPlugin = require('./ModelI18nPlugin');
registerBpmnJSPlugin(modelI18NPlugin);

},{"./ModelI18nPlugin":1,"camunda-modeler-plugin-helpers":3}],3:[function(require,module,exports){
/**
 * Validate and register a client plugin.
 *
 * @param {Object} plugin
 * @param {String} type
 */
function registerClientPlugin(plugin, type) {
  var plugins = window.plugins || [];
  window.plugins = plugins;

  if (!plugin) {
    throw new Error('plugin not specified');
  }

  if (!type) {
    throw new Error('type not specified');
  }

  plugins.push({
    plugin: plugin,
    type: type
  });
}

/**
 * Validate and register a bpmn-js plugin.
 *
 * Example use:
 *
 *    var registerBpmnJSPlugin = require('./camundaModelerPluginHelpers').registerBpmnJSPlugin;
 *    var module = require('./index');
 *
 *    registerBpmnJSPlugin(module);
 *
 * @param {Object} plugin
 */
function registerBpmnJSPlugin(plugin) {
  registerClientPlugin(plugin, 'bpmn.modeler.additionalModules');
}

module.exports.registerBpmnJSPlugin = registerBpmnJSPlugin;

},{}],4:[function(require,module,exports){
/**
 * Module dependencies.
 */

try {
  var index = require('indexof');
} catch (err) {
  var index = require('component-indexof');
}

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var className = this.el.getAttribute('class') || '';
  var str = className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

},{"component-indexof":6,"indexof":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],7:[function(require,module,exports){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

},{}],8:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = Object.prototype.hasOwnProperty.call(map, tag) ? map[tag] : map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],9:[function(require,module,exports){
module.exports = require('component-classes');
},{"component-classes":4}],10:[function(require,module,exports){
module.exports = function(el) {

  var c;

  while (el.childNodes.length) {
    c = el.childNodes[0];
    el.removeChild(c);
  }

  return el;
};
},{}],11:[function(require,module,exports){
module.exports = require('domify');
},{"domify":8}],12:[function(require,module,exports){
module.exports = require('component-event');
},{"component-event":5}],13:[function(require,module,exports){
module.exports = require('component-query');
},{"component-query":7}]},{},[2]);
