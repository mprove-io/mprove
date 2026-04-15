import { z } from 'zod';

export let zReportDataColumn = z
  .object({
    id: z.number(),
    fields: z.intersection(
      z.object({ timestamp: z.number() }),
      z.record(z.string(), z.any())
    )
  })
  .meta({ id: 'ReportDataColumn' });

export type ReportDataColumn = z.infer<typeof zReportDataColumn>;
