import { z } from 'zod';
import { zRunTile } from '#common/zod/z-run/z-run-tile';

export let zRunDashboard = z.object({
  title: z.string().nullish(),
  dashboardId: z.string().nullish(),
  url: z.string().nullish(),
  tiles: z.array(zRunTile).nullish()
});
