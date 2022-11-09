import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';
import { getTimezones } from '~common/functions/get-timezones';

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
      type: 'string',
      enum: getTimezones()
        .filter(x => x.value !== constants.USE_PROJECT_TIMEZONE_VALUE)
        .map(t => t.value)
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
