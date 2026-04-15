import { z } from 'zod';
import { zRunTile } from '#common/zod/backend/run/run-tile';

export let zRunDashboard = z
  .object({
    title: z.string(),
    dashboardId: z.string(),
    url: z.string(),
    tiles: z.array(zRunTile)
  })
  .meta({ id: 'RunDashboard' });

export type RunDashboard = z.infer<typeof zRunDashboard>;
