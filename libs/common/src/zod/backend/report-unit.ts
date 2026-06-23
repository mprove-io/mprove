import { z } from 'zod';

export let zReportUnit = z
  .object({
    type: z.literal('reportUnit'),
    id: z.string(),
    reportId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(z.string()),
    author: z.string().nullish(),
    canEditOrDeleteReport: z.boolean(),
    isFavorite: z.boolean(),
    draft: z.boolean(),
    displaySpace: z.string(),
    displayAccessRoles: z.array(
      z.object({
        role: z.string(),
        isDirect: z.boolean()
      })
    )
  })
  .meta({ id: 'ReportUnit' });

export type ReportUnit = z.infer<typeof zReportUnit>;
