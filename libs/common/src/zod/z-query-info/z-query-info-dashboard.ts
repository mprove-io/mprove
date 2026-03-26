import { z } from 'zod';
import { zQueryInfoTile } from '#common/zod/z-query-info/z-query-info-tile';

export let zQueryInfoDashboard = z.object({
  title: z.string(),
  dashboardId: z.string(),
  url: z.string(),
  tiles: z.array(zQueryInfoTile)
});
