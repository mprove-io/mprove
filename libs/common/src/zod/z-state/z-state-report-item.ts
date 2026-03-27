import { z } from 'zod';

export let zStateReportItem = z.object({
  reportId: z.string().nullish(),
  url: z.string().nullish()
});
