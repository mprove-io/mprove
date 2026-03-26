import { z } from 'zod';

export let zRunChart = z.object({
  title: z.string(),
  chartId: z.string(),
  url: z.string(),
  query: z.object({
    queryId: z.string(),
    status: z.string(),
    lastErrorMessage: z.string().optional()
  })
});
