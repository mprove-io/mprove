import { JSONSchema7 } from 'json-schema';

export const MEASURE_SCHEMA: JSONSchema7 = {
  properties: {
    measure: {
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
    format_number: {
      type: 'string'
    },
    currency_prefix: {
      type: 'string'
    },
    currency_suffix: {
      type: 'string'
    },
    sql: {
      type: 'string'
    },
    sql_key: {
      type: 'string'
    },
    percentile: {
      type: 'string'
    }
  },
  required: ['measure', 'type', 'sql']
};
