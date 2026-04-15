import { z } from 'zod';
import { zFilterX } from '#common/zod/backend/filter-x';
import { zModelX } from '#common/zod/backend/model-x';
import { zTileX } from '#common/zod/backend/tile-x';
import { zDashboard } from '#common/zod/blockml/dashboard';

export let zDashboardX = zDashboard
  .extend({
    extendedFilters: z.array(zFilterX),
    tiles: z.array(zTileX),
    author: z.string(),
    canEditOrDeleteDashboard: z.boolean(),
    storeModels: z.array(zModelX)
  })
  .meta({ id: 'DashboardX' });

export type DashboardX = z.infer<typeof zDashboardX>;
