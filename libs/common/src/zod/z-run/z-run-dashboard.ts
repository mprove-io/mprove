import { z } from 'zod';
import { zRunTile } from '#common/zod/z-run/z-run-tile';

export let zRunDashboard = z.object({
  title: z.string(),
  dashboardId: z.string(),
  url: z.string(),
  tiles: z.array(zRunTile)
});
