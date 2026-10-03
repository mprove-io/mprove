import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type Space = {
  space: string;
  title?: string;
  fullTitle: string;
  filePath: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
};

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

assertTypesEqual<Space, z.infer<typeof zSpace>>({ value: true });
