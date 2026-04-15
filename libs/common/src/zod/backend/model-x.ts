import { z } from 'zod';
import { zModel } from '#common/zod/blockml/model';

export let zModelX = zModel
  .extend({
    hasAccess: z.boolean()
  })
  .meta({ id: 'ModelX' });

export type ModelX = z.infer<typeof zModelX>;
