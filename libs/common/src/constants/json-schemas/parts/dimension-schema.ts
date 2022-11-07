import { JSONSchema7 } from 'json-schema';

export const DIMENSION_SCHEMA: JSONSchema7 = {
  properties: {
    dimension: {
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
    type: {
      // type: 'enum'
    },
    result: {
      // type: 'enum'
    },
    sql: {
      type: 'string'
    },
    unnest: {
      type: 'string'
    },
    format_number: {
      type: 'string'
    },
    currency_prefix: {
      type: 'string'
    },
    currency_suffix: {
      type: 'string'
    }
  },
  required: ['dimension', 'sql']
};
