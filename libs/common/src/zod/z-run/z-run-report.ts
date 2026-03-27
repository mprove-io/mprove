import { z } from 'zod';
import { zRunReportRow } from '#common/zod/z-run/z-run-report-row';

export let zRunReport = z.object({
  title: z.string().nullish(),
  reportId: z.string().nullish(),
  url: z.string().nullish(),
  rows: z.array(zRunReportRow).nullish()
});
