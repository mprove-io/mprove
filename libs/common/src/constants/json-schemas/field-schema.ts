import { JSONSchema7 } from 'json-schema';
import { FIELD_RESULT_VALUES, FIELD_TYPE_VALUES } from '~common/constants/top';

export const FIELD_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/fields',
  type: 'object',
  additionalProperties: false,
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
      type: 'string',
      enum: FIELD_TYPE_VALUES
    },
    result: {
      type: 'string',
      enum: FIELD_RESULT_VALUES
    },
    suggest_model_dimension: {
      type: 'string'
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
    },
    time: {
      type: 'string'
    },
    group_label: {
      type: 'string'
    },
    group_description: {
      type: 'string'
    },
    // source: {
    //   type: 'string'
    // },
    timeframes: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    measure: {
      type: 'string'
    },
    sql_key: {
      type: 'string'
    },
    percentile: {
      type: 'integer',
      minimum: 1,
      maximum: 99
    },
    calculation: {
      type: 'string'
    }
  }
};
