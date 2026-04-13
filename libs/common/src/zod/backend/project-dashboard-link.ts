import { z } from 'zod';

export let zProjectDashboardLink = z
  .object({
    projectId: z.string(),
    dashboardId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectDashboardLink' });

export type ZProjectDashboardLink = z.infer<typeof zProjectDashboardLink>;
