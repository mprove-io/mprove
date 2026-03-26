import { z } from 'zod';

export let zStateReportItem = z.object({
  reportId: z.string(),
  url: z.string()
});
