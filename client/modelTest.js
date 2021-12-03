'use strict';

var domify = require('min-dom/lib/domify'),
  domEvent = require('min-dom/lib/event'),
  domClasses = require('min-dom/lib/classes'),
  domQuery = require('min-dom/lib/query'),
  clear = require('min-dom/lib/clear');
const event = require('min-dom/lib/event');
const BpmnJS = require('bpmn-js/lib/Modeler');
const registerBpmnJSModdleExtension = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;

const BpmnModdle = require('bpmn-moddle');
const i18n = require('bpmn-i18n-moddle/resources/bpmn-i18n.json').i18n;
const BpmnExt = require('bpmn-i18n-moddle/resources/bpmn-i18n.json')
const cloneDeep = require('clone-deep');

function ModelTestPlugin(elementRegistry, canvas, modeling) {
  this._elementRegistry = elementRegistry;
  this._modeling = modeling;
  this._bpmnFactory = modeling._elementFactory._bpmnFactory;
  this._moddle = modeling._elementFactory._moddle;

  const container = canvas.getContainer();

  var moddleDescriptor = {
    name: 'i18n Translation Support for BPMN',
    uri: BpmnExt.uri,
    prefix: 'i18n',
  };
  registerBpmnJSModdleExtension(moddleDescriptor);
  console.log(this._moddle.registry.packages)
  const bpmnJS = new BpmnJS({
    container,
    moddleExtensions: {
      moddleDescriptor,
    },
    keyboard: {
      bindTo: document
    }
  });


  registerBpmnJSModdleExtension(moddleDescriptor);
  console.log(bpmnJS.moddle.registry.packages);
  const translation = moddle.create('i18n:Translation', { 'xml:lang': 'en', body: 'Start me up' });

  const extensionElements = moddle.create('bpmn:ExtensionElements', {
    values: [translation]
  });
}

ModelTestPlugin.$inject = ['elementRegistry', 'editorActions', 'canvas', 'modeling', 'eventBus'];

module.exports = {
  __init__: ['ModelTestPlugin'],
  ModelTestPlugin: ['type', ModelTestPlugin]
};
