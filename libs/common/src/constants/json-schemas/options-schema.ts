import { JSONSchema7 } from 'json-schema';
import { CHART_TYPE_VALUES } from '~common/constants/top';

export const OPTIONS_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/dashboard#tile-options',
  type: 'object',
  additionalProperties: false,
  properties: {
    format: {
      type: 'boolean'
    },
    x_axis: {
      type: 'object',
      additionalProperties: false,
      properties: {
        scale: {
          type: 'boolean'
        }
      }
    },
    y_axis: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          scale: {
            type: 'boolean'
          }
        }
      }
    },
    series: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          data_row_id: {
            type: 'string'
          },
          data_field: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: CHART_TYPE_VALUES
          },
          y_axis_index: {
            type: 'integer'
          }
        }
      }
    }
  }
};
