import { JSONSchema7 } from 'json-schema';
import { PROJECT_WEEK_START_VALUES } from '~common/constants/top';
import { getTimezonesValues } from '~common/functions/get-timezones-values';

export const CONFIG_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/mprove-project-config',
  type: 'object',
  additionalProperties: false,
  properties: {
    mprove_dir: {
      type: 'string'
    },
    week_start: {
      type: 'string',
      enum: PROJECT_WEEK_START_VALUES
    },
    allow_timezones: {
      type: 'boolean'
    },
    default_timezone: {
      type: 'string',
      enum: getTimezonesValues()
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
    case_sensitive_string_filters: {
      type: 'boolean'
    }
  },
  required: ['mprove_dir']
};
