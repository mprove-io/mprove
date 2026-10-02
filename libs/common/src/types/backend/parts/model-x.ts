import { z } from 'zod';
import { zAccessRoleCombined } from '#common/types/access-role-combined';
import { zModel } from '#common/types/blockml/parts/model';

export let zModelX = zModel
  .extend({
    hasAccess: z.boolean(),
    spaceFullTitle: z.string(),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'ModelX' });

export type ModelX = z.infer<typeof zModelX>;
