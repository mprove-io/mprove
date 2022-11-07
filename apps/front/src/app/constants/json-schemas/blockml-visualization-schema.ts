import { JSONSchema7 } from 'json-schema';
import { blockmlReportSchema } from './blockml-report-schema';

export const blockmlVisualizationSchema: JSONSchema7 = {
  properties: {
    visualization: {
      type: 'boolean'
    },
    reports: {
      type: 'array',
      items: blockmlReportSchema
    }
  }
};
