import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ModelSt = {
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  source: string;
  filePath: string;
  space?: string;
  spaceFullTitle: string;
  label: string;
};

export let zModelSt = z
  .object({
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    source: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    spaceFullTitle: z.string(),
    label: z.string()
  })
  .meta({ id: 'ModelSt' });

assertTypesEqual<ModelSt, z.infer<typeof zModelSt>>({ value: true });
