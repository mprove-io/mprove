import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Gv, zGv } from '#common/types/backend/parts/gv';

export type Role = { projectId: string; roleId: string; gvs: Gv[] };

export let zRole = z
  .object({
    projectId: z.string(),
    roleId: z.string(),
    gvs: z.array(zGv)
  })
  .meta({ id: 'Role' });

assertTypesEqual<Role, z.infer<typeof zRole>>({ value: true });
