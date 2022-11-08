import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';

export const CONFIG_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/mprove-project-config',
  type: 'object',
  additionalProperties: false,
  properties: {
    mprove_dir: {
      type: 'string'
    },
    week_start: {
      type: 'string',
      enum: constants.PROJECT_WEEK_START_VALUES
    },
    allow_timezones: {
      type: 'boolean'
    },
    default_timezone: {
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
  required: ['mprove_dir']
};
