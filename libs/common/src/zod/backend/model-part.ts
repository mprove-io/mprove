import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';

export let zModelPart = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'ModelPart' });

export type ModelPart = z.infer<typeof zModelPart>;
