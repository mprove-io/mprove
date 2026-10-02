import { z } from 'zod';
import { zQueryInfoTile } from '#common/types/backend/parts/query-info/query-info-tile';

export let zQueryInfoDashboard = z
  .object({
    title: z.string(),
    dashboardId: z.string(),
    url: z.string(),
    tiles: z.array(zQueryInfoTile)
  })
  .meta({ id: 'QueryInfoDashboard' });

export type QueryInfoDashboard = z.infer<typeof zQueryInfoDashboard>;
