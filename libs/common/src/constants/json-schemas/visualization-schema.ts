import { JSONSchema7 } from 'json-schema';
import { REPORT_SCHEMA } from './parts/report-schema';

export const VISUALIZATION_SCHEMA: JSONSchema7 = {
  properties: {
    vis: {
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
    reports: {
      type: 'array',
      items: REPORT_SCHEMA
    }
  },
  required: ['vis', 'reports']
};
