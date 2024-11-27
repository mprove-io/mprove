import { JSONSchema7 } from 'json-schema';
import { FIELD_SCHEMA } from './field-schema';
import { FILTER_SCHEMA } from './parameters/filter-schema';

export const VIEW_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/view',
  type: 'object',
  additionalProperties: false,
  properties: {
    view: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    label: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    table: {
      type: 'string'
    },
    derived_table: {
      type: 'string'
    },
    udfs: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    parameters: {
      type: 'array',
      items: FILTER_SCHEMA
    },
    fields: {
      type: 'array',
      items: FIELD_SCHEMA
      // items: {
      //   anyOf: [
      //     DIMENSION_SCHEMA,
      //     TIME_SCHEMA,
      //     MEASURE_SCHEMA,
      //     CALCULATION_SCHEMA
      //   ]
      // }
    }
  },
  required: ['view', 'connection']
};
