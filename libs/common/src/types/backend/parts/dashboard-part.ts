import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Tile, zTile } from '#common/types/blockml/parts/tile';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type DashboardPart = {
  structId: string;
  dashboardId: string;
  draft: boolean;
  creatorId: string;
  title: string;
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  tiles: Tile[];
  author?: string;
  canEditOrDeleteDashboard: boolean;
};

export let zDashboardPart = z
  .object({
    structId: z.string(),
    dashboardId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    title: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    tiles: z.array(zTile),
    author: z.string().nullish(),
    canEditOrDeleteDashboard: z.boolean()
  })
  .meta({ id: 'DashboardPart' });

assertTypesEqual<DashboardPart, z.infer<typeof zDashboardPart>>({
  value: true
});
