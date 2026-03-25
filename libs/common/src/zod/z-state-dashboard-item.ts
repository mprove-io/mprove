import { z } from 'zod';

export let zStateDashboardItem = z.object({
  dashboardId: z.string(),
  url: z.string()
});
