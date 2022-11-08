import { JSONSchema7 } from 'json-schema';

export const UDF_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/user-defined-function',
  type: 'object',
  additionalProperties: false,
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
