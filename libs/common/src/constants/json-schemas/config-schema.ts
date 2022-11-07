import { JSONSchema7 } from 'json-schema';

export const CONFIG_SCHEMA: JSONSchema7 = {
  properties: {
    mprove_dir: {
      type: 'string'
    },
    week_start: {
      // type: 'enum'
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
