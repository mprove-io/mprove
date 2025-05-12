import { JSONSchema7 } from 'json-schema';
import { FILTER_SCHEMA } from './parameters/filter-schema';
import { TILE_SCHEMA } from './tile-schema';

export const DASHBOARD_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/dashboard',
  type: 'object',
  additionalProperties: false,
  properties: {
    dashboard: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    parameters: {
      type: 'array',
      items: FILTER_SCHEMA
    },
    tiles: {
      type: 'array',
      items: TILE_SCHEMA
    }
  },
  required: ['dashboard']
};
