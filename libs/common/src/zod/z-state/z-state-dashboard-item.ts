import { z } from 'zod';

export let zStateDashboardItem = z.object({
  dashboardId: z.string().nullish(),
  url: z.string().nullish()
});
