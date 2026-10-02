import { z } from 'zod';
import { zModelX } from '#common/types/backend/model-x';

export let zModelXWithTotalDashboards = zModelX
  .extend({
    totalDashboards: z.number()
  })
  .meta({ id: 'ModelXWithTotalDashboards' });

export type ModelXWithTotalDashboards = z.infer<
  typeof zModelXWithTotalDashboards
>;
