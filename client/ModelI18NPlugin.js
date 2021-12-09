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

'use strict';

var domify = require('min-dom/lib/domify'),
  domEvent = require('min-dom/lib/event'),
  domClasses = require('min-dom/lib/classes'),
  domQuery = require('min-dom/lib/query'),
  clear = require('min-dom/lib/clear');
const event = require('min-dom/lib/event');



// The default language
const defaultLanguage = "en";

const defaultState = {
  currentLanguage: defaultLanguage,
  languages: ["en"],
  options: [{ value: "en", label: "English" }],
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
  });

  // fired when the language is changed
  ModelI18NPlugin.prototype.onChange = function (event) {
    event.preventDefault();
    self.ChangeLanguage(event.target.value);
  }

  // Look for Languages after the model is done loading
  eventBus.on('import.done', function () {
    self.defaultLanguage = bpmnjs._definitions.$attrs['xml:lang']
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
    self.state.languagesLoaded = true;
    if (self.state.languages.length <= 1) {
      self.destroyLanguageContainer(canvas.getContainer().parentNode)
    }
    self.importDone = true;
  });

  // only does anything when you come back from looking at the raw XML
  eventBus.on('canvas.resized', function () {
    if (!self.importDone) {
      return;
    }
    self.defaultLanguage = bpmnjs._definitions.$attrs['xml:lang']
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
    self.state.languagesLoaded = true;
    if (self.state.languages.length <= 1) {
      self.destroyLanguageContainer(canvas.getContainer().parentNode)
    }
  });

  // when you save he diagram, or go look at raw XML, remove the english
  // <i18n:Translation> elements.
  eventBus.on('saveXML.start', function () {
    self.destroyLanguageContainer(canvas.getContainer().parentNode);
    self.destroyDefault();
  });

}

// remove all the <i18n:Translation> objects we inserted.
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
        var extElements = busObj.extensionElements
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
}

// go spelunking through the model and find all the languages
// and generate the options for the dropdown
ModelI18NPlugin.prototype.generateAndShow = function () {
  this.generateLangs();
  this.showLangs();
};

// add the dropdown to the canvas
ModelI18NPlugin.prototype.addChangeLanguageContainer = function (container) {
  var self = this;
  var markup = '<div id="langElem" class="djs-popup dgs-model-i18n"> \
      <select class="id-list"></select> \
    </div>';
  this.element = domify(markup);
  container.appendChild(this.element);
  domEvent.bind(domQuery('.id-list', this.element), 'change', function (event) {
    self.onChange(event, { passive: true });
  });
};

// remove the dropdown from the canvas if we only have 1 language.
ModelI18NPlugin.prototype.destroyLanguageContainer = function (container) {
  var el = document.getElementById('langElem');
  if (el != undefined && el != null) {
    container.removeChild(el);
  }
};

// go spelunking through the model and find all the languages
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
};

// Build the languages menu...
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
          opts.push({ value: langs[key], label: 'English' });
          break;
        case "de":
          opts.push({ value: langs[key], label: 'German' });
          break;
        case "fr":
          opts.push({ value: langs[key], label: 'French' });
          break;
        case "es":
          opts.push({ value: langs[key], label: 'Spanish' });
          break;
        case "it":
          opts.push({ value: langs[key], label: 'Italian' });
          break;
        case "nl":
          opts.push({ value: langs[key], label: 'Dutch' });
          break;
        case "pt":
          opts.push({ value: langs[key], label: 'Portuguese' });
          break;
        case "ru":
          opts.push({ value: langs[key], label: 'Russian' });
          break;
        case "sv":
          opts.push({ value: langs[key], label: 'Swedish' });
          break;
        case "zh":
          opts.push({ value: langs[key], label: 'Chinese' });
          break;
        default:
          opts.push({ value: langs[key], label: langs[key] });
      }
    });
  }
  if (opts.length > 0) {
    Object.keys(opts).forEach(function (key) {
      var el = "<option value=" + opts[key].value + ">" + opts[key].label + "</option>"
      var element = domify(el);
      idList.appendChild(element);
    });
    var ele = domQuery('.id-list');
    domEvent.bind(ele, 'change', function (event, value) {
      self.onChange(event, value, { passive: true });
    });
  }
  this.options = opts;
};

// Fired when we change the language.
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
                name: label,
              }
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
