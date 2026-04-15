import { z } from 'zod';
import { zTile } from '#common/zod/blockml/tile';

export let zDashboardPart = z
  .object({
    structId: z.string(),
    dashboardId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    title: z.string(),
    filePath: z.string(),
    accessRoles: z.array(z.string()),
    tiles: z.array(zTile),
    author: z.string(),
    canEditOrDeleteDashboard: z.boolean()
  })
  .meta({ id: 'DashboardPart' });

export type DashboardPart = z.infer<typeof zDashboardPart>;
