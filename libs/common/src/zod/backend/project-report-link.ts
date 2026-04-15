import { z } from 'zod';

export let zProjectReportLink = z
  .object({
    projectId: z.string(),
    reportId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectReportLink' });

export type ProjectReportLink = z.infer<typeof zProjectReportLink>;
