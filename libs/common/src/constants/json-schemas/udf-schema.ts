import { JSONSchema7 } from 'json-schema';

export const UDF_SCHEMA: JSONSchema7 = {
  properties: {
    udf: {
      type: 'string'
    },
    sql: {
      type: 'string'
    }
  },
  required: ['udf', 'sql']
};
