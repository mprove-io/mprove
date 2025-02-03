import { JSONSchema7 } from 'json-schema';

export const STORE_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/store',
  type: 'object',
  additionalProperties: false,
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
    // parameters: {
    //   type: 'string'
    // },
    // results: {
    //   type: 'string'
    // },
    build_metrics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          time_label: {
            type: 'string'
          },
          ms_utc_suffix: {
            type: 'string'
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                unit: {
                  type: 'string'
                },
                dimension: {
                  type: 'string'
                }
              },
              required: ['unit', 'dimension']
            }
          }
        },
        required: ['time_label', 'details']
      }
    },
    field_groups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          group: {
            type: 'string'
          },
          label: {
            type: 'string'
          },
          show_if: {
            type: 'boolean'
          }
        },
        required: ['group']
      }
    },
    fields: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
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
          show_if: {
            type: 'boolean'
          },
          required: {
            type: 'boolean'
          },
          meta: {
            type: 'string'
          }
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
          // calculation: {
          //   type: 'string'
          // },
        },
        required: ['result']
      }
    }
  },
  required: [
    'store',
    'connection',
    'method',
    'url_path',
    'body',
    'response',
    'results',
    'fields'
  ]
};
