import { z } from 'zod';
import { zDashboardField } from '#common/types/blockml/parts/dashboard-field';
import { zTile } from '#common/types/blockml/parts/tile';
import { zAccessRoleCombined } from '#common/types/shared/access-role-combined';

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

export type Dashboard = z.infer<typeof zDashboard>;
