import { z } from 'zod';
import { zModelPart } from '#common/zod/backend/model-part';

export let zModelPartX = zModelPart
  .extend({
    hasAccess: z.boolean()
  })
  .meta({ id: 'ModelPartX' });

export type ModelPartX = z.infer<typeof zModelPartX>;
