import { JSONSchema7 } from 'json-schema';
import { FILTER_SCHEMA } from './fields/filter-schema';
import { REPORT_SCHEMA } from './report-schema';

export const DASHBOARD_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/dashboard',
  type: 'object',
  additionalProperties: false,
  properties: {
    dashboard: {
      type: 'string'
    },
    title: {
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
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    fields: {
      type: 'array',
      items: FILTER_SCHEMA
    },
    reports: {
      type: 'array',
      items: REPORT_SCHEMA
    }
  },
  required: ['dashboard', 'reports']
};
