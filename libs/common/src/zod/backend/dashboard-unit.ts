import { z } from 'zod';
import { zTile } from '#common/zod/blockml/tile';

export let zDashboardUnit = z
  .object({
    type: z.literal('dashboardUnit'),
    id: z.string(),
    structId: z.string(),
    dashboardId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(z.string()),
    tiles: z.array(zTile),
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
