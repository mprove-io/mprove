import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/types/blockml/parts/dashboard-field';
import { type Tile, zTile } from '#common/types/blockml/parts/tile';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type DashboardSt = {
  title: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
  fields: DashboardField[];
};

export let zDashboardSt = z
  .object({
    title: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    tiles: z.array(zTile),
    fields: z.array(zDashboardField)
  })
  .meta({ id: 'DashboardSt' });

assertTypesEqual<DashboardSt, z.infer<typeof zDashboardSt>>({ value: true });
