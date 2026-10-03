import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardX,
  zDashboardX
} from '#common/types/backend/parts/dashboard-x';
import type { Extend } from '#common/types/extend';
import { type TileX2, zTileX2 } from '#common/types/front/tile-x-2';

export type DashboardX2 = Extend<DashboardX, { tiles: TileX2[] }>;

export let zDashboardX2 = zDashboardX
  .extend({
    tiles: z.array(zTileX2)
  })
  .meta({ id: 'DashboardX2' });

assertTypesEqual<DashboardX2, z.infer<typeof zDashboardX2>>({ value: true });
