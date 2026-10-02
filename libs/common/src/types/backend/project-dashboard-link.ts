import { z } from 'zod';

export let zProjectDashboardLink = z
  .object({
    projectId: z.string(),
    dashboardId: z.string(),
    navTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectDashboardLink' });

export type ProjectDashboardLink = z.infer<typeof zProjectDashboardLink>;
