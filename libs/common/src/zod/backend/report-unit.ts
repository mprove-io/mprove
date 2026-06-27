import { z } from 'zod';
import { zAccessRoleCombined } from '#common/zod/access-role-combined';

export let zReportUnit = z
  .object({
    type: z.literal('reportUnit'),
    id: z.string(),
    reportId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteReport: z.boolean(),
    isFavorite: z.boolean(),
    draft: z.boolean(),
    spaceFullTitle: z.string()
  })
  .meta({ id: 'ReportUnit' });

export type ReportUnit = z.infer<typeof zReportUnit>;
