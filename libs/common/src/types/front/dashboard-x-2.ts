import { z } from 'zod';
import { zDashboardX } from '#common/types/backend/dashboard-x';
import { zTileX2 } from '#common/types/front/tile-x-2';

export let zDashboardX2 = zDashboardX
  .extend({
    tiles: z.array(zTileX2)
  })
  .meta({ id: 'DashboardX2' });

export type DashboardX2 = z.infer<typeof zDashboardX2>;
