var registerBpmnJSPlugin = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;

var modelI18NPlugin = require('./ModelI18nPlugin');
registerBpmnJSPlugin(modelI18NPlugin);
