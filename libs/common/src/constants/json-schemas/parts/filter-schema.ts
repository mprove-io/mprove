import { JSONSchema7 } from 'json-schema';

export const FILTER_SCHEMA: JSONSchema7 = {
  properties: {
    filter: {
      type: 'string'
    },
    hidden: {
      type: 'boolean'
    },
    label: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    result: {
      // type: 'enum'
    },
    default: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: ['filter']
};
