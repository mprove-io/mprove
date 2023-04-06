import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';
import { FIELD_SCHEMA } from './field-schema';

// const commonJoinProperties: JSONSchema7['properties'] = {
//   hidden: {
//     type: 'boolean'
//   },
//   label: {
//     type: 'string'
//   },
//   description: {
//     type: 'string'
//   },
//   as: {
//     type: 'string'
//   },
//   hide_fields: {
//     type: 'array',
//     items: {
//       type: 'string'
//     }
//   },
//   show_fields: {
//     type: 'array',
//     items: {
//       type: 'string'
//     }
//   }
// };

// const fromJoin: JSONSchema7 = {
//   $id: 'https://docs.mprove.io/schema-joins-from-join',
//   type: 'object',
//   additionalProperties: false,
//   properties: Object.assign(commonJoinProperties, {
//     from_view: {
//       type: 'string'
//     }
//   })
// };

// const joinView: JSONSchema7 = {
//   $id: 'https://docs.mprove.io/schema-joins-join-view',
//   type: 'object',
//   additionalProperties: false,
//   properties: Object.assign(commonJoinProperties, {
//     join_view: {
//       type: 'string'
//     },
//     type: {
//       type: 'string',
//       enum: constants.JOIN_TYPE_VALUES
//     },
//     sql_on: {
//       type: 'string'
//     },
//     sql_where: {
//       type: 'string'
//     }
//   })
// };

export const MODEL_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/model-and-joins',
  type: 'object',
  additionalProperties: false,
  properties: {
    model: {
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
    build_metrics: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          time: {
            type: 'string'
          }
        },
        required: ['time']
      }
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    always_join: {
      type: 'string'
    },
    sql_always_where: {
      type: 'string'
    },
    sql_always_where_calc: {
      type: 'string'
    },
    udfs: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    joins: {
      type: 'array',
      items: {
        // anyOf: [fromJoin, joinView],
        type: 'object',
        additionalProperties: false,
        properties: {
          hidden: {
            type: 'boolean'
          },
          label: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          as: {
            type: 'string'
          },
          hide_fields: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          show_fields: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          //
          from_view: {
            type: 'string'
          },
          //
          join_view: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: constants.JOIN_TYPE_VALUES
          },
          sql_on: {
            type: 'string'
          },
          sql_where: {
            type: 'string'
          }
        },
        required: ['as']
      }
    },
    fields: {
      type: 'array',
      items: FIELD_SCHEMA
      // items: {
      //   anyOf: [
      //     DIMENSION_SCHEMA,
      //     TIME_SCHEMA,
      //     MEASURE_SCHEMA,
      //     CALCULATION_SCHEMA,
      //     FILTER_SCHEMA
      //   ]
      // }
    }
  },
  required: ['model', 'connection', 'joins']
};
