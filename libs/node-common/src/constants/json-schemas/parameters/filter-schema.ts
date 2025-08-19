import { JSONSchema7 } from 'json-schema';
import { FILTER_RESULT_VALUES } from '~common/constants/top';

export const FILTER_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/fields/filter',
  type: 'object',
  additionalProperties: false,
  properties: {
    filter: {
      type: 'string'
    },
    hidden: {
      type: 'boolean'
    },
    label: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    result: {
      type: 'string',
      enum: FILTER_RESULT_VALUES
    },
    store_model: {
      type: 'string'
    },
    store_result: {
      type: 'string'
    },
    store_filter: {
      type: 'string'
    },
    suggest_model_dimension: {
      type: 'string'
    },
    conditions: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    fractions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['controls'],
        properties: {
          logic: {
            type: 'string'
          },
          type: {
            type: 'string'
          },
          controls: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                input: {
                  type: 'string'
                },
                list_input: {
                  type: 'string'
                },
                switch: {
                  type: 'string'
                },
                selector: {
                  type: 'string'
                },
                date_picker: {
                  type: 'string'
                },
                value: {
                  type: ['string', 'number', 'boolean']
                },
                values: {
                  type: 'array',
                  items: {
                    type: ['string', 'number', 'boolean']
                  }
                },
                label: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
};
