import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';
import { FILTER_SCHEMA } from './parameters/filter-schema';

export const REPORT_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/report',
  type: 'object',
  additionalProperties: false,
  properties: {
    report: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    parameters: {
      type: 'array',
      items: FILTER_SCHEMA
    },
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          row_id: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: constants.ROW_TYPE_VALUES
          },
          metric: {
            type: 'string'
          },
          formula: {
            type: 'string'
          },
          show_chart: {
            type: 'boolean'
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
          parameters_formula: {
            type: 'string'
          },
          parameters: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                apply_to: {
                  type: 'string'
                },
                listen: {
                  type: 'string'
                },
                formula: {
                  type: 'string'
                },
                conditions: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              },
              required: ['apply_to']
            }
          }
        },
        required: ['row_id', 'type']
      }
    }
  },
  required: ['report', 'title', 'rows']
};
