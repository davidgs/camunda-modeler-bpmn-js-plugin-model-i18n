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
    self.ChangeLanguage(event.target.value);
  }
  this.addChangeLanguageContainer(canvas.getContainer().parentNode);

  eventBus.on('import.done', function () {
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
  });
}

ModelI18NPlugin.prototype.generateAndShow = function() {
  this.generateLangs();
  this.showLangs();
};

ModelI18NPlugin.prototype.addChangeLanguageContainer = function(container) {
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

ModelI18NPlugin.prototype.ChangeLanguage = function (id) {
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
