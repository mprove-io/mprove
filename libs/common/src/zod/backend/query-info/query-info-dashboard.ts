import { z } from 'zod';
import { zQueryInfoTile } from '#common/zod/backend/query-info/query-info-tile';

export let zQueryInfoDashboard = z
  .object({
    title: z.string(),
    dashboardId: z.string(),
    url: z.string(),
    tiles: z.array(zQueryInfoTile)
  })
  .meta({ id: 'QueryInfoDashboard' });

export type ZQueryInfoDashboard = z.infer<typeof zQueryInfoDashboard>;
