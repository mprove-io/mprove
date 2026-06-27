import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';
import { zDashboardField } from '#common/zod/blockml/dashboard-field';
import { zTile } from '#common/zod/blockml/tile';

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
