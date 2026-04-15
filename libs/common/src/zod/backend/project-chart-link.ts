import { z } from 'zod';

export let zProjectChartLink = z
  .object({
    projectId: z.string(),
    chartId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectChartLink' });

export type ProjectChartLink = z.infer<typeof zProjectChartLink>;
