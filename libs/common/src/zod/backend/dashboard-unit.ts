import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';
export let zDashboardUnit = z
  .object({
    type: z.literal('dashboardUnit'),
    id: z.string(),
    dashboardId: z.string(),
    draft: z.boolean(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteDashboard: z.boolean(),
    isFavorite: z.boolean(),
    spaceFullTitle: z.string()
  })
  .meta({ id: 'DashboardUnit' });

export type DashboardUnit = z.infer<typeof zDashboardUnit>;
