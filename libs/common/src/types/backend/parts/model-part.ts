import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ModelPart = {
  structId: string;
  modelId: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
};

export let zModelPart = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'ModelPart' });

assertTypesEqual<ModelPart, z.infer<typeof zModelPart>>({ value: true });
