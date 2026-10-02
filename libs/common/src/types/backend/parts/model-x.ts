import { z } from 'zod';
import { zModel } from '#common/types/blockml/parts/model';
import { zAccessRoleCombined } from '#common/types/shared/access-role-combined';

export let zModelX = zModel
  .extend({
    hasAccess: z.boolean(),
    spaceFullTitle: z.string(),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'ModelX' });

export type ModelX = z.infer<typeof zModelX>;
