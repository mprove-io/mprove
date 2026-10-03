import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type QueryInfoTile,
  zQueryInfoTile
} from '#common/types/backend/parts/query-info/query-info-tile';

export type QueryInfoDashboard = {
  title: string;
  dashboardId: string;
  url: string;
  tiles: QueryInfoTile[];
};

export let zQueryInfoDashboard = z
  .object({
    title: z.string(),
    dashboardId: z.string(),
    url: z.string(),
    tiles: z.array(zQueryInfoTile)
  })
  .meta({ id: 'QueryInfoDashboard' });

assertTypesEqual<QueryInfoDashboard, z.infer<typeof zQueryInfoDashboard>>({
  value: true
});
