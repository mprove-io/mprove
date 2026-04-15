import { z } from 'zod';

export let zStateDashboardItem = z
  .object({
    dashboardId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateDashboardItem' });

export type StateDashboardItem = z.infer<typeof zStateDashboardItem>;
