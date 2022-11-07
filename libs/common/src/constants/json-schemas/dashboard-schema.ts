import { JSONSchema7 } from 'json-schema';
import { FILTER_SCHEMA } from './parts/filter-schema';
import { REPORT_SCHEMA } from './parts/report-schema';

export const DASHBOARD_SCHEMA: JSONSchema7 = {
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
