import { JSONSchema7 } from 'json-schema';
import { STORE_CONTROL_SCHEMA } from './store-control-schema';

export const STORE_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/store',
  type: 'object',
  additionalProperties: false,
  required: [
    'store',
    'connection',
    'method',
    'request',
    'response',
    'results',
    'fields'
  ],
  properties: {
    store: {
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
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    method: {
      type: 'string'
    },
    request: {
      type: 'string'
    },
    response: {
      type: 'string'
    },
    date_range_includes_right_side: {
      type: 'boolean'
    },
    parameters: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['filter', 'fraction_controls'],
        properties: {
          filter: {
            type: 'string'
          },
          max_fractions: {
            type: 'integer'
          },
          required: {
            type: 'boolean'
          },
          fraction_controls: {
            type: 'array',
            items: STORE_CONTROL_SCHEMA
          }
        }
      }
    },
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['result', 'fraction_types'],
        properties: {
          result: {
            type: 'string'
          },
          fraction_types: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['type'],
              properties: {
                type: {
                  type: 'string'
                },
                label: {
                  type: 'string'
                },
                meta: {},
                controls: {
                  type: 'array',
                  items: STORE_CONTROL_SCHEMA
                }
              }
            }
          }
        }
      }
    },
    build_metrics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['time'],
        properties: {
          time: {
            type: 'string'
          }
        }
      }
    },
    field_groups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['group'],
        properties: {
          group: {
            type: 'string'
          },
          label: {
            type: 'string'
          }
        }
      }
    },
    field_time_groups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['time'],
        properties: {
          time: {
            type: 'string'
          },
          group: {
            type: 'string'
          },
          label: {
            type: 'string'
          }
        }
      }
    },
    fields: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['result'],
        properties: {
          dimension: {
            type: 'string'
          },
          measure: {
            type: 'string'
          },
          label: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          result: {
            type: 'string'
          },
          group: {
            type: 'string'
          },
          time_group: {
            type: 'string'
          },
          detail: {
            type: 'string'
          },
          required: {
            type: 'boolean'
          },
          meta: {}
        }
      }
    }
  }
};
