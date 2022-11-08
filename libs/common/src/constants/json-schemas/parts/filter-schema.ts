import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';

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
      type: 'string',
      enum: constants.FILTER_RESULT_VALUES
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
