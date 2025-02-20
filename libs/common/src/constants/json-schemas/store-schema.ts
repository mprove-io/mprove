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
    'url_path',
    'body',
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
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
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
    url_path: {
      type: 'string'
    },
    body: {
      type: 'string'
    },
    response: {
      type: 'string'
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
          show_if: {
            type: 'string'
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
                or: {
                  type: 'boolean'
                },
                and_not: {
                  type: 'boolean'
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
          },
          show_if: {
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
          },
          show_if: {
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
          show_if: {
            type: 'string'
          },
          required: {
            type: 'boolean'
          },
          meta: {}
          // calculation: {
          //   type: 'string'
          // },
          // hidden: {
          //   type: 'boolean'
          // },
          // type: {
          //   type: 'string',
          //   enum: constants.FIELD_TYPE_VALUES
          // },
          // suggest_model_dimension: {
          //   type: 'string'
          // },
          // format_number: {
          //   type: 'string'
          // },
          // currency_prefix: {
          //   type: 'string'
          // },
          // currency_suffix: {
          //   type: 'string'
          // },
        }
      }
    }
  }
};
