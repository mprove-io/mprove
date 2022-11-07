import { JSONSchema7 } from 'json-schema';

export const CALCULATION_SCHEMA: JSONSchema7 = {
  properties: {
    calculation: {
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
    sql: {
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
  required: ['calculation', 'sql']
};
