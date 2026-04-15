import { z } from 'zod';
import { zRunQuery } from '#common/zod/backend/run/run-query';

export let zRunReportRow = z
  .object({
    title: z.string(),
    query: zRunQuery
  })
  .meta({ id: 'RunReportRow' });

export type RunReportRow = z.infer<typeof zRunReportRow>;
