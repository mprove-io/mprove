import { z } from 'zod';
import { zDashboardX } from '#common/zod/backend/dashboard-x';
import { zTileX2 } from '#common/zod/front/tile-x-2';

export let zDashboardX2 = zDashboardX
  .extend({
    tiles: z.array(zTileX2)
  })
  .meta({ id: 'DashboardX2' });

export type DashboardX2 = z.infer<typeof zDashboardX2>;
