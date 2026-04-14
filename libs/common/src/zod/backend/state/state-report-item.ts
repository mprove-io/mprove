import { z } from 'zod';

export let zStateReportItem = z
  .object({
    reportId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateReportItem' });

export type ZStateReportItem = z.infer<typeof zStateReportItem>;
