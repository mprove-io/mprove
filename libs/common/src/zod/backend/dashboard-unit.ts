import { z } from 'zod';
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
    accessRolesCombined: z.array(z.string()),
    author: z.string().nullish(),
    canEditOrDeleteDashboard: z.boolean(),
    isFavorite: z.boolean(),
    displaySpace: z.string(),
    displayAccessRoles: z.array(
      z.object({
        role: z.string(),
        isDirect: z.boolean()
      })
    )
  })
  .meta({ id: 'DashboardUnit' });

export type DashboardUnit = z.infer<typeof zDashboardUnit>;
