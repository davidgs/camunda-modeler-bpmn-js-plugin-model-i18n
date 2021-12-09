/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/ModelI18nPlugin.js":
/*!***********************************!*\
  !*** ./client/ModelI18nPlugin.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/**
 * MIT License
 *
 * Copyright (c) 2021 David G. Simmons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


var domify = __webpack_require__(/*! min-dom/lib/domify */ "./node_modules/min-dom/lib/domify.js"),
    domEvent = __webpack_require__(/*! min-dom/lib/event */ "./node_modules/min-dom/lib/event.js"),
    domClasses = __webpack_require__(/*! min-dom/lib/classes */ "./node_modules/min-dom/lib/classes.js"),
    domQuery = __webpack_require__(/*! min-dom/lib/query */ "./node_modules/min-dom/lib/query.js"),
    clear = __webpack_require__(/*! min-dom/lib/clear */ "./node_modules/min-dom/lib/clear.js");

const event = __webpack_require__(/*! min-dom/lib/event */ "./node_modules/min-dom/lib/event.js"); // The default language


const defaultLanguage = "en";
const defaultState = {
  currentLanguage: defaultLanguage,
  languages: ["en"],
  options: [{
    value: "en",
    label: "English"
  }],
  selected: 'en'
};

function ModelI18NPlugin(elementRegistry, editorActions, canvas, modeling, eventBus, bpmnjs) {
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._bpmnFactory = modeling._elementFactory._bpmnFactory;
  this._moddle = modeling._elementFactory._moddle;
  this.bpmnjs = bpmnjs;
  this.importDone = false;
  this.defaultLanguage = '';
  var self = this;
  this.state = defaultState;
  editorActions.register({
    generateLangs: function () {
      self.generateAndShow();
    },
    onChange: function (event) {
      self.onChange(event);
    }
  }); // fired when the language is changed

  ModelI18NPlugin.prototype.onChange = function (event) {
    event.preventDefault();
    self.ChangeLanguage(event.target.value);
  }; // Look for Languages after the model is done loading


  eventBus.on('import.done', function () {
    self.defaultLanguage = bpmnjs._definitions.$attrs['xml:lang'];
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
    self.state.languagesLoaded = true;

    if (self.state.languages.length <= 1) {
      self.destroyLanguageContainer(canvas.getContainer().parentNode);
    }

    self.importDone = true;
  }); // only does anything when you come back from looking at the raw XML

  eventBus.on('canvas.resized', function () {
    if (!self.importDone) {
      return;
    }

    self.defaultLanguage = bpmnjs._definitions.$attrs['xml:lang'];
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
    self.state.languagesLoaded = true;

    if (self.state.languages.length <= 1) {
      self.destroyLanguageContainer(canvas.getContainer().parentNode);
    }
  }); // when you save he diagram, or go look at raw XML, remove the english
  // <i18n:Translation> elements.

  eventBus.on('saveXML.start', function () {
    self.destroyLanguageContainer(canvas.getContainer().parentNode);
    self.destroyDefault();
  });
} // remove all the <i18n:Translation> objects we inserted.


ModelI18NPlugin.prototype.destroyDefault = function () {
  var self = this;
  self.ChangeLanguage(self.defaultLanguage);
  const elementRegistry = this._elementRegistry;
  const elements = elementRegistry._elements;
  const modeling = this._modeling;
  Object.keys(elements).forEach(function (key) {
    const task = elementRegistry.get(key);
    const busObj = task.businessObject;

    if (busObj != undefined && busObj != null) {
      if (busObj.hasOwnProperty('extensionElements')) {
        var extElements = busObj.extensionElements;

        if (extElements.hasOwnProperty('values')) {
          var vals = extElements.values;
          Object.keys(vals).forEach(function (key) {
            if (vals[key].$type === 'i18n:Translation') {
              if (vals[key].$attrs['xml:lang'] === self.defaultLanguage) {
                vals.splice(key, 1);
              }
            }
          });
          busObj.extensionElements.values = vals;
          modeling.updateProperties(task, {
            extensionElements: extElements
          });
        }
      }
    }
  });
}; // go spelunking through the model and find all the languages
// and generate the options for the dropdown


ModelI18NPlugin.prototype.generateAndShow = function () {
  this.generateLangs();
  this.showLangs();
}; // add the dropdown to the canvas


ModelI18NPlugin.prototype.addChangeLanguageContainer = function (container) {
  var self = this;
  var markup = '<div id="langElem" class="djs-popup dgs-model-i18n"> \
      <select class="id-list"></select> \
    </div>';
  this.element = domify(markup);
  container.appendChild(this.element);
  domEvent.bind(domQuery('.id-list', this.element), 'change', function (event) {
    self.onChange(event, {
      passive: true
    });
  });
}; // remove the dropdown from the canvas if we only have 1 language.


ModelI18NPlugin.prototype.destroyLanguageContainer = function (container) {
  var el = document.getElementById('langElem');

  if (el != undefined && el != null) {
    container.removeChild(el);
  }
}; // go spelunking through the model and find all the languages
// when we find them, register them, and add an entry for the default language


ModelI18NPlugin.prototype.generateLangs = function () {
  var self = this;
  var langs = [];
  langs.push(self.defaultLanguage);
  const elementRegistry = this._elementRegistry;
  const elements = elementRegistry._elements;
  const bpmnFactory = this._bpmnFactory;
  const modeling = this._modeling;
  Object.keys(elements).forEach(function (key) {
    const task = elementRegistry.get(key);
    const busObj = task.businessObject;
    var en_name = busObj.name;

    if (busObj.hasOwnProperty('extensionElements')) {
      if (busObj.extensionElements.hasOwnProperty('values')) {
        var hasDefault = false;
        busObj.extensionElements.values.forEach(function (value) {
          if (value.$type === 'i18n:Translation') {
            if (value.$attrs['xml:lang'] === self.defaultLanguage) {
              hasDefault = true;
            }

            if (!langs.includes(value.$attrs['xml:lang'])) {
              langs.push(value.$attrs['xml:lang']);
            }
          }
        });

        if (!hasDefault) {
          const extElements = busObj.get("extensionElements");
          const translation = bpmnFactory.create("i18n:Translation");
          translation.$parent = extElements;
          translation.$attrs['xml:lang'] = self.defaultLanguage;
          translation.body = en_name;
          extElements.get("values").push(translation);
          modeling.updateProperties(task, {
            extensionElements: extElements
          });
        }
      }
    }
  });

  if (langs.length > 0) {
    self.state.languages = langs;
  }
}; // Build the languages menu...


ModelI18NPlugin.prototype.showLangs = function () {
  var self = this;
  var opts = [];
  var idList = domQuery('.id-list', this.element);
  clear(idList);
  let langs = this.state.languages;

  if (!langs.length > 0) {
    return;
  }

  if (langs != null && langs.length > 0) {
    Object.keys(langs).forEach(function (key) {
      switch (langs[key]) {
        case "en":
          opts.push({
            value: langs[key],
            label: 'English'
          });
          break;

        case "de":
          opts.push({
            value: langs[key],
            label: 'German'
          });
          break;

        case "fr":
          opts.push({
            value: langs[key],
            label: 'French'
          });
          break;

        case "es":
          opts.push({
            value: langs[key],
            label: 'Spanish'
          });
          break;

        case "it":
          opts.push({
            value: langs[key],
            label: 'Italian'
          });
          break;

        case "nl":
          opts.push({
            value: langs[key],
            label: 'Dutch'
          });
          break;

        case "pt":
          opts.push({
            value: langs[key],
            label: 'Portuguese'
          });
          break;

        case "ru":
          opts.push({
            value: langs[key],
            label: 'Russian'
          });
          break;

        case "sv":
          opts.push({
            value: langs[key],
            label: 'Swedish'
          });
          break;

        case "zh":
          opts.push({
            value: langs[key],
            label: 'Chinese'
          });
          break;

        default:
          opts.push({
            value: langs[key],
            label: langs[key]
          });
      }
    });
  }

  if (opts.length > 0) {
    Object.keys(opts).forEach(function (key) {
      var el = "<option value=" + opts[key].value + ">" + opts[key].label + "</option>";
      var element = domify(el);
      idList.appendChild(element);
    });
    var ele = domQuery('.id-list');
    domEvent.bind(ele, 'change', function (event, value) {
      self.onChange(event, value, {
        passive: true
      });
    });
  }

  this.options = opts;
}; // Fired when we change the language.


ModelI18NPlugin.prototype.ChangeLanguage = function (id) {
  var self = this;
  var lang = id;
  const elementRegistry = this._elementRegistry;
  const elements = elementRegistry._elements;
  Object.keys(elements).forEach(function (key) {
    const task = elementRegistry.get(key);
    const busObj = task.businessObject;

    if (task != undefined && busObj != undefined) {
      if (busObj.hasOwnProperty('extensionElements') && busObj.extensionElements.values != undefined) {
        var exts = busObj.extensionElements.values;
        Object.keys(exts).forEach(function (key) {
          if (exts[key].$attrs.hasOwnProperty('xml:lang')) {
            if (exts[key].$attrs['xml:lang'] === lang) {
              var label = exts[key].body;
              var props = {
                name: label
              };

              self._modeling.updateProperties(task, props);
            }
          }
        });
      }
    }
  });
};

ModelI18NPlugin.$inject = ['elementRegistry', 'editorActions', 'canvas', 'modeling', 'eventBus', 'bpmnjs'];
module.exports = {
  __init__: ['modelI18NPlugin'],
  modelI18NPlugin: ['type', ModelI18NPlugin]
};

/***/ }),

/***/ "./node_modules/camunda-modeler-plugin-helpers/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/camunda-modeler-plugin-helpers/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "registerClientPlugin": () => (/* binding */ registerClientPlugin),
/* harmony export */   "registerBpmnJSPlugin": () => (/* binding */ registerBpmnJSPlugin),
/* harmony export */   "registerBpmnJSModdleExtension": () => (/* binding */ registerBpmnJSModdleExtension),
/* harmony export */   "getModelerDirectory": () => (/* binding */ getModelerDirectory),
/* harmony export */   "getPluginsDirectory": () => (/* binding */ getPluginsDirectory)
/* harmony export */ });
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
 * @param {Object} module
 *
 * @example
 *
 * import {
 *   registerBpmnJSPlugin
 * } from 'camunda-modeler-plugin-helpers';
 *
 * const BpmnJSModule = {
 *   __init__: [ 'myService' ],
 *   myService: [ 'type', ... ]
 * };
 *
 * registerBpmnJSPlugin(BpmnJSModule);
 */
function registerBpmnJSPlugin(module) {
  registerClientPlugin(module, 'bpmn.modeler.additionalModules');
}

/**
 * Validate and register a bpmn-moddle extension plugin.
 *
 * @param {Object} descriptor
 *
 * @example
 * import {
 *   registerBpmnJSModdleExtension
 * } from 'camunda-modeler-plugin-helpers';
 *
 * var moddleDescriptor = {
 *   name: 'my descriptor',
 *   uri: 'http://example.my.company.localhost/schema/my-descriptor/1.0',
 *   prefix: 'mydesc',
 *
 *   ...
 * };
 *
 * registerBpmnJSModdleExtension(moddleDescriptor);
 */
function registerBpmnJSModdleExtension(descriptor) {
  registerClientPlugin(descriptor, 'bpmn.modeler.moddleExtension');
}

/**
 * Return the modeler directory, as a string.
 *
 * @deprecated Will be removed in future Camunda Modeler versions without replacement.
 *
 * @return {String}
 */
function getModelerDirectory() {
  return window.getModelerDirectory();
}

/**
 * Return the modeler plugin directory, as a string.
 *
 * @deprecated Will be removed in future Camunda Modeler versions without replacement.
 *
 * @return {String}
 */
function getPluginsDirectory() {
  return window.getPluginsDirectory();
}

/***/ }),

/***/ "./node_modules/component-classes/index.js":
/*!*************************************************!*\
  !*** ./node_modules/component-classes/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

try {
  var index = __webpack_require__(/*! indexof */ "./node_modules/component-indexof/index.js");
} catch (err) {
  var index = __webpack_require__(/*! component-indexof */ "./node_modules/component-indexof/index.js");
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


/***/ }),

/***/ "./node_modules/component-event/index.js":
/*!***********************************************!*\
  !*** ./node_modules/component-event/index.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

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

/***/ }),

/***/ "./node_modules/component-indexof/index.js":
/*!*************************************************!*\
  !*** ./node_modules/component-indexof/index.js ***!
  \*************************************************/
/***/ ((module) => {

module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/***/ }),

/***/ "./node_modules/component-query/index.js":
/*!***********************************************!*\
  !*** ./node_modules/component-query/index.js ***!
  \***********************************************/
/***/ ((module, exports) => {

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


/***/ }),

/***/ "./node_modules/domify/index.js":
/*!**************************************!*\
  !*** ./node_modules/domify/index.js ***!
  \**************************************/
/***/ ((module) => {


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


/***/ }),

/***/ "./node_modules/min-dom/lib/classes.js":
/*!*********************************************!*\
  !*** ./node_modules/min-dom/lib/classes.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! component-classes */ "./node_modules/component-classes/index.js");

/***/ }),

/***/ "./node_modules/min-dom/lib/clear.js":
/*!*******************************************!*\
  !*** ./node_modules/min-dom/lib/clear.js ***!
  \*******************************************/
/***/ ((module) => {

module.exports = function(el) {

  var c;

  while (el.childNodes.length) {
    c = el.childNodes[0];
    el.removeChild(c);
  }

  return el;
};

/***/ }),

/***/ "./node_modules/min-dom/lib/domify.js":
/*!********************************************!*\
  !*** ./node_modules/min-dom/lib/domify.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! domify */ "./node_modules/domify/index.js");

/***/ }),

/***/ "./node_modules/min-dom/lib/event.js":
/*!*******************************************!*\
  !*** ./node_modules/min-dom/lib/event.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! component-event */ "./node_modules/component-event/index.js");

/***/ }),

/***/ "./node_modules/min-dom/lib/query.js":
/*!*******************************************!*\
  !*** ./node_modules/min-dom/lib/query.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! component-query */ "./node_modules/component-query/index.js");

/***/ }),

/***/ "./client/bpmn-js-extension/propertiesProvider/i18n.json":
/*!***************************************************************!*\
  !*** ./client/bpmn-js-extension/propertiesProvider/i18n.json ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"bpmn-i18n","uri":"http://www.omg.org/spec/BPMN/non-normative/extensions/i18n/1.0","prefix":"i18n","types":[{"name":"Translation","superClass":["Element"],"properties":[{"name":"id","isAttr":true,"isId":true,"type":"String"},{"name":"body","isBody":true,"type":"String"},{"name":"target","isAttr":true,"type":"String","default":"@name"},{"name":"textFormat","isAttr":"true","type":"String","default":"text/plain"}]}],"enumerations":[],"associations":[],"xml":{"tagAlias":"lowerCase","typePrefix":"t"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./client/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! camunda-modeler-plugin-helpers */ "./node_modules/camunda-modeler-plugin-helpers/index.js");
/* harmony import */ var _ModelI18nPlugin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ModelI18nPlugin */ "./client/ModelI18nPlugin.js");
/* harmony import */ var _ModelI18nPlugin__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_ModelI18nPlugin__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _bpmn_js_extension_propertiesProvider_i18n_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bpmn-js-extension/propertiesProvider/i18n.json */ "./client/bpmn-js-extension/propertiesProvider/i18n.json");
/**
 * MIT License
 *
 * Copyright (c) 2021 David G. Simmons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */



(0,camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__.registerBpmnJSModdleExtension)(_bpmn_js_extension_propertiesProvider_i18n_json__WEBPACK_IMPORTED_MODULE_2__);
(0,camunda_modeler_plugin_helpers__WEBPACK_IMPORTED_MODULE_0__.registerBpmnJSPlugin)((_ModelI18nPlugin__WEBPACK_IMPORTED_MODULE_1___default()));
})();

/******/ })()
;
//# sourceMappingURL=client.js.map