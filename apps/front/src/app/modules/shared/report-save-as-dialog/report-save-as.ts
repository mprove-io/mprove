import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const reportSaveAsValues = ['NEW_REPORT', 'REPLACE_EXISTING_REPORT'] as const;

export type ReportSaveAs = (typeof reportSaveAsValues)[number];

export let zReportSaveAs = z.enum(reportSaveAsValues);

assertTypesEqual<ReportSaveAs, z.infer<typeof zReportSaveAs>>({
  value: true
});
