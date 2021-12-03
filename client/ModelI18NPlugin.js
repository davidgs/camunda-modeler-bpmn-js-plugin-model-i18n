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
const BpmnJS = require('bpmn-js/lib/Modeler');

const BpmnModdle = require('bpmn-moddle');
const i18n = require('bpmn-i18n-moddle/resources/bpmn-i18n.json').i18n;
const BpmnExt = require('bpmn-i18n-moddle/resources/bpmn-i18n.json')
const cloneDeep = require('clone-deep');


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

  var self = this;
  this.state = defaultState;
  this._moddle.getPackages().forEach(function (pkg) {
    console.log(pkg.name);
  });
  // const moddle = new BpmnModdle({ i18n: BpmnExt });

  // const translation = moddle.create('i18n:Translation', { 'xml:lang': 'de', body: 'Startereignis' });

  // const extensionElements = moddle.create('bpmn:ExtensionElements', {
  //   values: [translation]
  // });

  // console.log(extensionElements.get('values'));
  editorActions.register({
    generateLangs: function () {
      self.generateAndShow();
    },
    onChange: function (event) {
      self.onChange(event);
    }
  });

  // event fired when a language is selected
  ModelI18NPlugin.prototype.onChange = function (event) {
    event.preventDefault();
    self.ChangeLanguage(event.target.value);
  }
  this.addChangeLanguageContainer(canvas.getContainer().parentNode);

  // Look for Languages after the model is done loading
  eventBus.on('import.done', function () {
    console.log(bpmnjs._definitions.$attrs['xml:lang']);
    self.addChangeLanguageContainer(canvas.getContainer().parentNode);
    self.generateAndShow();
    self.state.languagesLoaded = true;
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
  var markup = '<div class="djs-popup dgs-model-i18n"> \
      <select class="id-list"></select> \
    </div>';
  this.element = domify(markup);
  container.appendChild(this.element);
  domEvent.bind(domQuery('.id-list', this.element), 'change', function (event) {
    self.onChange(event, { passive: true });
  });
};

// go spelunking through the model and find all the languages
ModelI18NPlugin.prototype.generateLangs = function () {
  var self = this;
  var langs = [];
  langs.push('en');
  var elements = this._elementRegistry._elements;
  const lang = "xml:lang";
  const elementRegistry = this._elementRegistry;
  const bpmnFactory = this._bpmnFactory;
  const modeling = this._modeling;
  Object.keys(elements).forEach(function (key) {
    if (elements[key].type != 'label') {
      var businessObject = elements[key].element.businessObject;
      var en_name = elements[key].element.businessObject.name;
      //var task = elements[key];
      if (businessObject.hasOwnProperty('extensionElements')) {
        if (businessObject.extensionElements.hasOwnProperty('values')) {
          // var desc = {
          //   isGeneric: true,
          //   name: "i18n:translation",
          //   ns: {
          //     prefix: 'i18n',
          //     localName: 'translation',
          //     uri: "http://www.omg.org/spec/BPMN/non-normative/extensions/i18n/1.0"
          //   }
          // }
          // const tmpElem = cloneDeep(businessObject.extensionElements.values[0], true);
          // var enElement = bpmnFactory.create('bpmn:ExtensionElements', { values: [tmpElem] });
          // enElement.values[0].$body = en_name;
          // enElement.values[0][lang] = 'en';
          // enElement.values[0].$descriptor = desc;
          var hasEnglish = false;
          businessObject.extensionElements.values.forEach(function (value) {
            // var props = value.get('properties');
            if (value.hasOwnProperty('xml:lang')) {
              var labelLang = value['xml:lang'];
              if (labelLang === 'en') {
                hasEnglish = true;
              }
              if (!langs.includes(labelLang)) {
                langs.push(labelLang);
              }
            }
          });
          if (!hasEnglish) {

            const tId = businessObject.id;
            console.log(tId);
            // const elementRegistry = bpmnJS.get("elementRegistry");
            // const bpmnFactory = bpmnJS.get("bpmnFactory");
            // const modeling = bpmnJS.get("modeling");
            const extElements = bpmnFactory.create("bpmn:ExtensionElements");
            extElements.$parent = businessObject;
            const task = elementRegistry.get(tId);
            // (2.3) add i18n element
            // const translation = bpmnFactory.create("i18n:translation");
            // translation.$parent = extElements;

            // translation.id = "en";
            // translation.body = en_name;
            // translation.target = '@name';
            // //translation.$attrs = {};
            // translation.$attrs[lang] = 'en';

            // //extElements.$parent.get("values").push(translation);
            // businessObject.extensionElements.values.push(translation); //enElement.values[0]);
            // (2.4) push extensionElements
            // modeling.updateProperties(task, {
            //   businessObject: businessObject
            // });

          }
        }
      }
    }
  });
  if (langs.length > 0) {
    this.state.languages = langs;
  }
};

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
    for (var x = 0; x < opts.length; x++) {
      var el = "<option value=" + opts[x].value + ">" + opts[x].label + "</option>"
      this.element = domify(el);

      idList.appendChild(this.element);
    }
    var ele = domQuery('.id-list');
    domEvent.bind(ele, 'change', function (event, value) {
      self.onChange(event, value, { passive: true });
    });
  }
  this.options = opts;
};

ModelI18NPlugin.prototype.ChangeLanguage = function (id) {
  var self = this;
  var lang = id; //arguments[0];
  const elementRegistry = this._elementRegistry;
  const bpmnFactory = this._bpmnFactory;
  const modeling = this._modeling;
  var elements = this._elementRegistry._elements;
  Object.keys(elements).forEach(function (key) {
    var e = elements[key];
    if (elements[key] != undefined) {
      if (elements[key].type != 'label') {
        var element = elements[key].element;
        var businessObject = elements[key].element.businessObject;
        if (businessObject.hasOwnProperty('extensionElements')) {
          var exts = businessObject.extensionElements;
          if (exts != null) {
            for (var z = 0; z < exts.values.length; z++) {
              if (exts.values[z].hasOwnProperty('xml:lang')) {
                if (exts.values[z]['xml:lang'] === lang) {
                  var label = exts.values[z].$body;
                 // businessObject.name = label;
                  var props = {
                    name: label,
                  }
                  // var props = businessObject.get('properties');
                  self._modeling.updateProperties(element,  props );
                  break;
                }
              }
            }
          }
        }
      }
    }
  });
};


ModelI18NPlugin.$inject = ['elementRegistry', 'editorActions', 'canvas', 'modeling', 'eventBus', 'bpmnjs'];

module.exports = {
  __init__: ['modelI18NPlugin'],
  modelI18NPlugin: ['type', ModelI18NPlugin]
};
