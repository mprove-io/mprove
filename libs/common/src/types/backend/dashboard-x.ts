import { z } from 'zod';
import { zFilterX } from '#common/types/backend/filter-x';
import { zModelX } from '#common/types/backend/model-x';
import { zTileX } from '#common/types/backend/tile-x';
import { zDashboard } from '#common/types/blockml/dashboard';

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
