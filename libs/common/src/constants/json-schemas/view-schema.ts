import { JSONSchema7 } from 'json-schema';
import { CALCULATION_SCHEMA } from './parts/calculation-schema';
import { DIMENSION_SCHEMA } from './parts/dimension-schema';
import { FILTER_SCHEMA } from './parts/filter-schema';
import { MEASURE_SCHEMA } from './parts/measure-schema';
import { TIME_SCHEMA } from './parts/time-schema';

export const VIEW_SCHEMA: JSONSchema7 = {
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
    fields: {
      type: 'array',
      items: {
        anyOf: [
          DIMENSION_SCHEMA,
          TIME_SCHEMA,
          MEASURE_SCHEMA,
          CALCULATION_SCHEMA,
          FILTER_SCHEMA
        ]
      }
    }
  },
  required: ['view', 'connection']
};
