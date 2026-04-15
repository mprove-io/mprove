import { z } from 'zod';
import { zRunReportRow } from '#common/zod/backend/run/run-report-row';

export let zRunReport = z
  .object({
    title: z.string(),
    reportId: z.string(),
    url: z.string(),
    rows: z.array(zRunReportRow)
  })
  .meta({ id: 'RunReport' });

export type RunReport = z.infer<typeof zRunReport>;
