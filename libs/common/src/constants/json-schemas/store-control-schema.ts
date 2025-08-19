import { JSONSchema7 } from 'json-schema';

export const STORE_CONTROL_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/store/control',
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
    },
    required: {
      type: 'boolean'
    },
    options: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['value'],
        properties: {
          value: {
            type: ['string', 'number', 'boolean']
          },
          label: {
            type: 'string'
          }
        }
      }
    }
  }
};
