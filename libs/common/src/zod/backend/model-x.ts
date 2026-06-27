import { z } from 'zod';
import { zModel } from '#common/zod/blockml/model';

export let zModelX = zModel
  .extend({
    hasAccess: z.boolean(),
    spaceFullTitle: z.string(),
    displayAccessRoles: z.array(
      z.object({
        role: z.string(),
        isDirect: z.boolean()
      })
    )
  })
  .meta({ id: 'ModelX' });

export type ModelX = z.infer<typeof zModelX>;
