import { JSONSchema7 } from 'json-schema';
import { blockmlReportSchema } from './blockml-report-schema';

export const blockmlDashboardSchema: JSONSchema7 = {
  properties: {
    dashboard: {
      type: 'boolean'
    },
    reports: {
      type: 'array',
      items: blockmlReportSchema
    }
  }
};
