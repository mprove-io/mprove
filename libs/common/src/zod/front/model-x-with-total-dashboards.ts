import { z } from 'zod';
import { zModelX } from '#common/zod/backend/model-x';

export let zModelXWithTotalDashboards = zModelX
  .extend({
    totalDashboards: z.number()
  })
  .meta({ id: 'ModelXWithTotalDashboards' });

export type ModelXWithTotalDashboards = z.infer<
  typeof zModelXWithTotalDashboards
>;
