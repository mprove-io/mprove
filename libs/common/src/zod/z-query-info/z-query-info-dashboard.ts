import { z } from 'zod';
import { zQueryInfoTile } from '#common/zod/z-query-info/z-query-info-tile';

export let zQueryInfoDashboard = z.object({
  title: z.string().nullish(),
  dashboardId: z.string().nullish(),
  url: z.string().nullish(),
  tiles: z.array(zQueryInfoTile).nullish()
});
