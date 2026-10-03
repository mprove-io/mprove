import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RunReportRow,
  zRunReportRow
} from '#common/types/backend/parts/run/run-report-row';

export type RunReport = {
  title: string;
  reportId: string;
  url: string;
  rows: RunReportRow[];
};

export let zRunReport = z
  .object({
    title: z.string(),
    reportId: z.string(),
    url: z.string(),
    rows: z.array(zRunReportRow)
  })
  .meta({ id: 'RunReport' });

assertTypesEqual<RunReport, z.infer<typeof zRunReport>>({ value: true });
