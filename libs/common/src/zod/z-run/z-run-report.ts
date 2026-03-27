import { z } from 'zod';
import { zRunReportRow } from '#common/zod/z-run/z-run-report-row';

export let zRunReport = z.object({
  title: z.string(),
  reportId: z.string(),
  url: z.string(),
  rows: z.array(zRunReportRow)
});
