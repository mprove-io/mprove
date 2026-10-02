import { z } from 'zod';
import { zGv } from '#common/types/backend/gv';

export let zRole = z
  .object({
    projectId: z.string(),
    roleId: z.string(),
    gvs: z.array(zGv)
  })
  .meta({ id: 'Role' });

export type Role = z.infer<typeof zRole>;
