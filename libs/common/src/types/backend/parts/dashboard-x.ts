import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type FilterX, zFilterX } from '#common/types/backend/parts/filter-x';
import { type ModelX, zModelX } from '#common/types/backend/parts/model-x';
import { type TileX, zTileX } from '#common/types/backend/parts/tile-x';
import {
  type Dashboard,
  zDashboard
} from '#common/types/blockml/parts/dashboard';
import type { Extend } from '#common/types/extend';

export type DashboardX = Extend<
  Dashboard,
  {
    extendedFilters: FilterX[];
    tiles: TileX[];
    author: string;
    canEditOrDeleteDashboard: boolean;
    storeModels: ModelX[];
  }
>;

export let zDashboardX = zDashboard
  .extend({
    extendedFilters: z.array(zFilterX),
    tiles: z.array(zTileX),
    author: z.string(),
    canEditOrDeleteDashboard: z.boolean(),
    storeModels: z.array(zModelX)
  })
  .meta({ id: 'DashboardX' });

assertTypesEqual<DashboardX, z.infer<typeof zDashboardX>>({ value: true });
