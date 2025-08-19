import { JSONSchema7 } from 'json-schema';
import { CHART_TYPE_VALUES } from '~common/constants/top';
import { getTimezonesValues } from '~common/functions/get-timezones-values';
import { OPTIONS_SCHEMA } from './options-schema';

export const TILE_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/dashboard#tile',
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    model: {
      type: 'string'
    },
    select: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    sorts: {
      type: 'string'
    },
    timezone: {
      type: 'string',
      enum: getTimezonesValues()
    },
    limit: {
      type: 'integer'
    },
    parameters: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          apply_to: {
            type: 'string'
          },
          listen: {
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
                      date_picker: {
                        type: 'string'
                      },
                      selector: {
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
                      }
                    },
                    required: ['value']
                  }
                }
              },
              required: ['controls']
            }
          }
        },
        required: ['apply_to']
      }
    },
    type: {
      type: 'string',
      enum: CHART_TYPE_VALUES
    },
    data: {
      type: 'object',
      additionalProperties: false,
      properties: {
        hide_columns: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        x_field: {
          type: 'string'
        },
        y_fields: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        multi_field: {
          type: 'string'
        },
        size_field: {
          type: 'string'
        }
      }
    },
    options: OPTIONS_SCHEMA,
    plate: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plate_width: {
          type: 'integer',
          minimum: 1,
          maximum: 24
        },
        plate_height: {
          type: 'integer',
          minimum: 1
        },
        plate_x: {
          type: 'integer',
          minimum: 0,
          maximum: 23
        },
        plate_y: {
          type: 'integer',
          minimum: 0
        }
      }
    }
  },
  required: ['title', 'model', 'select', 'type']
};
