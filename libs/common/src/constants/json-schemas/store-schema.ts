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
    }
    // parameters: {
    //   type: 'string'
    // },
    // results: {
    //   type: 'string'
    // },
    // build_metrics: {
    //   type: 'string'
    // },
    // field_groups: {
    //   type: 'string'
    // },
    // fields: {
    //   type: 'string'
    // }
  },
  required: ['store', 'connection']
};
