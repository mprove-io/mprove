import { JSONSchema7 } from 'json-schema';

export const TIME_SCHEMA: JSONSchema7 = {
  properties: {
    time: {
      type: 'string'
    },
    hidden: {
      type: 'boolean'
    },
    group_label: {
      type: 'string'
    },
    group_description: {
      type: 'string'
    },
    source: {
      // type: 'enum'
    },
    sql: {
      type: 'string'
    },
    unnest: {
      type: 'string'
    },
    timeframes: {
      type: 'array',
      items: {
        // type: 'enum'
      }
    }
  },
  required: ['time', 'sql']
};
