import { JSONSchema7 } from 'json-schema';
import { ROW_TYPE_VALUES } from '~common/constants/top';
import { OPTIONS_SCHEMA } from './options-schema';
import { FILTER_SCHEMA } from './parameters/filter-schema';

export const REPORT_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/reference/report',
  type: 'object',
  additionalProperties: false,
  properties: {
    report: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    parameters: {
      type: 'array',
      items: FILTER_SCHEMA
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          row_id: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: ROW_TYPE_VALUES
          },
          metric: {
            type: 'string'
          },
          formula: {
            type: 'string'
          },
          show_chart: {
            type: 'boolean'
          },
          format_number: {
            type: 'string'
          },
          currency_prefix: {
            type: 'string'
          },
          currency_suffix: {
            type: 'string'
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
          }
        },
        required: ['row_id', 'type']
      }
    },
    options: OPTIONS_SCHEMA
  },
  required: ['report', 'title', 'rows']
};
