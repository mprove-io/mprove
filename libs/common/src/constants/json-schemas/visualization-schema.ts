import { JSONSchema7 } from 'json-schema';
import { TILE_SCHEMA } from './tile-schema';

export const VISUALIZATION_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/visualization',
  type: 'object',
  additionalProperties: false,
  properties: {
    vis: {
      type: 'string'
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    tiles: {
      type: 'array',
      items: TILE_SCHEMA
    }
  },
  required: ['vis', 'tiles']
};
