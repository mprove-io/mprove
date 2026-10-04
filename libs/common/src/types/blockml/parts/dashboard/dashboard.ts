import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DashboardField,
  zDashboardField
} from '#common/types/blockml/parts/dashboard/dashboard-field';
import { type Tile, zTile } from '#common/types/blockml/parts/tile/tile';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type Dashboard = {
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
  fields: DashboardField[];
  content: any;
  serverTs: number;
};

export let zDashboard = z
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
    fields: z.array(zDashboardField),
    content: z.any(),
    serverTs: z.number().int()
  })
  .meta({ id: 'Dashboard' });

assertTypesEqual<Dashboard, z.infer<typeof zDashboard>>({ value: true });
