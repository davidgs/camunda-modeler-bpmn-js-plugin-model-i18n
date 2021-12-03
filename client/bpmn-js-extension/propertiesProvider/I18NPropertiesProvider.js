import inherits from 'inherits';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

export default function I18NPropertiesProvider(eventBus, commandStack, bpmnFactory, translate, selection, propertiesProvider, elementRegistry) {
  PropertiesActivator.call(this, eventBus);

  const self = this;

  this.getTabs = function (element) {

  }

  this.getProperties = function (element) {
    const generalTab = {
      id: 'general',
      label: translate('General'),
      groups: [
        {
          id: 'general',
          label: translate('General'),
          entries: [
            {
              id: 'name',
              label: translate('Name'),
              modelProperty: 'name',
              reference: 'name',
              get: function (element) {
                return {
                  name: element.get('name')
                };
              },
              set: function (element, values) {
                return {
                  name: values.name || undefined
                };
              },
              validate: function (element, values) {
                const getError = function (name) {
                  return {
                    name: {
                      current: name,
                      error: translate('Must have a name')
                    }
                  };
                };

                const name = values.name;

                if (!name) {
                  return getError(name);
                }
              }
            }
          ]
        }
      ]
    };

    return [
      generalTab
    ];
  }

  this.setProperty = function (element, property, value) {
    if (property === 'name') {
      element.label = value;
      elementRegistry.updateLabel(element);
    }
  }

  this.unsetProperty = function (element, property) {
    if (property === 'name') {
      element.label = undefined;
      elementRegistry.updateLabel(element);
    }
  }

  this.getEnv = function (element) {
    return {
      language: 'en'
    };
  }

  this.getDescription = function (element) {
    return '';
  }

}

inherits(I18NPropertiesProvider, PropertiesActivator);

I18NPropertiesProvider.$inject = ['eventBus', 'commandStack', 'bpmnFactory', 'translate', 'selection', 'propertiesProvider', 'elementRegistry'];