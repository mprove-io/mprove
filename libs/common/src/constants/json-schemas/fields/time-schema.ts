// import { JSONSchema7 } from 'json-schema';
// import { constants } from '~common/barrels/constants';

// export const TIME_SCHEMA: JSONSchema7 = {
//   $schema: 'http://json-schema.org/draft-07/schema#',
//   $id: 'https://docs.mprove.io/top/blockml/fields/time',
//   type: 'object',
//   additionalProperties: false,
//   properties: {
//     time: {
//       type: 'string'
//     },
//     hidden: {
//       type: 'boolean'
//     },
//     group_label: {
//       type: 'string'
//     },
//     group_description: {
//       type: 'string'
//     },
//     source: {
//       type: 'string',
//       enum: constants.TIME_SOURCE_VALUES
//     },
//     sql: {
//       type: 'string'
//     },
//     unnest: {
//       type: 'string'
//     },
//     timeframes: {
//       type: 'array',
//       items: {
//         type: 'string',
//         enum: constants.TIMEFRAME_VALUES
//       }
//     }
//   }
// };
