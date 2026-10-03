import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Model, zModel } from '#common/types/blockml/parts/model';
import type { Extend } from '#common/types/extend';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ModelX = Extend<
  Model,
  {
    hasAccess: boolean;
    spaceFullTitle: string;
    accessRolesCombined: AccessRoleCombined[];
  }
>;

export let zModelX = zModel
  .extend({
    hasAccess: z.boolean(),
    spaceFullTitle: z.string(),
    accessRolesCombined: z.array(zAccessRoleCombined)
  })
  .meta({ id: 'ModelX' });

assertTypesEqual<ModelX, z.infer<typeof zModelX>>({ value: true });
