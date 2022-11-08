import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';

export const REPORT_SCHEMA: JSONSchema7 = {
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    model: {
      type: 'string'
    },
    select: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    sorts: {
      type: 'string'
    },
    timezone: {
      type: 'string'
    },
    limit: {
      type: 'integer'
    },
    listen_filters: {
      properties: {}
    },
    default_filters: {
      properties: {}
    },
    type: {
      type: 'string',
      enum: constants.CHART_TYPE_VALUES
    },
    data: {},
    axis: {},
    options: {},
    tile: {}
  },
  required: ['title', 'model', 'select', 'type']
};
