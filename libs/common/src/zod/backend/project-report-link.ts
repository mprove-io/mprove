import { z } from 'zod';

export let zProjectReportLink = z
  .object({
    projectId: z.string(),
    reportId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectReportLink' });

export type ZProjectReportLink = z.infer<typeof zProjectReportLink>;
