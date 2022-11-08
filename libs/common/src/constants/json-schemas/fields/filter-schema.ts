import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';

export const FILTER_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/fields/filter',
  type: 'object',
  additionalProperties: false,
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
      type: 'string',
      enum: constants.FILTER_RESULT_VALUES
    },
    default: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};
