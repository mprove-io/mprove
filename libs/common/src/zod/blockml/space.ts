import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';

export let zSpace = z
  .object({
    space: z.string(),
    title: z.string().nullish(),
    fullTitle: z.string(),
    filePath: z.string(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'Space' });

export type Space = z.infer<typeof zSpace>;
