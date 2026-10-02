import { z } from 'zod';
import { zTile } from '#common/types/blockml/parts/tile';
import { zAccessRoleCombined } from '#common/types/shared/access-role-combined';

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

export type DashboardPart = z.infer<typeof zDashboardPart>;
