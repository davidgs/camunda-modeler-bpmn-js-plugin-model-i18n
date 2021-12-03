import I18NPropertiesProvider from './propertiesProvider/I18NPropertiesProvider';

/**
 * A bpmn-js module, defining all extension services and their dependencies.
 *
 */
export default {
  __init__: ['I18NPropertiesProvider'],
  I18NPropertiesProvider: ['type', I18NPropertiesProvider]
};
