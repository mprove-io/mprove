import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';

export const FIELD_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/fields',
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
      enum: constants.DIMENSION_TYPE_VALUES
    },
    result: {
      type: 'string',
      enum: constants.DIMENSION_RESULT_VALUES
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
    source: {
      type: 'string',
      enum: constants.TIME_SOURCE_VALUES
    },
    timeframes: {
      type: 'array',
      items: {
        type: 'string',
        enum: constants.TIMEFRAME_VALUES
      }
    },
    measure: {
      type: 'string'
    },
    sql_key: {
      type: 'string'
    },
    percentile: {
      type: 'string'
    },
    calculation: {
      type: 'string'
    },
    filter: {
      type: 'string'
    },
    default: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};
