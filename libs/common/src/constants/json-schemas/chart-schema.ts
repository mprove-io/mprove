import { JSONSchema7 } from 'json-schema';
import { TILE_SCHEMA } from './tile-schema';

export const CHART_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/chart',
  type: 'object',
  additionalProperties: false,
  properties: {
    chart: {
      type: 'string'
    },
    tiles: {
      type: 'array',
      items: TILE_SCHEMA
    }
  },
  required: ['chart', 'tiles']
};
