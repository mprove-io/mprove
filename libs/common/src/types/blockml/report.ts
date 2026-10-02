import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zAccessRoleCombined } from '#common/types/access-role-combined';
import { zColumn } from '#common/types/blockml/column';
import { zFraction } from '#common/types/blockml/fraction';
import { zMconfigChart } from '#common/types/blockml/mconfig-chart';
import { zReportField } from '#common/types/blockml/report-field';
import { zRow } from '#common/types/blockml/row';
import { zTimezone } from '#common/types/z-timezone';

export let zReport = z
  .object({
    projectId: z.string(),
    structId: z.string(),
    reportId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    filePath: z.string(),
    space: z.string().nullish(),
    fields: z.array(zReportField),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    title: z.string(),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFraction: zFraction,
    rangeStart: z.number().nullish(),
    rangeEnd: z.number().nullish(),
    columns: z.array(zColumn),
    rows: z.array(zRow),
    isTimeColumnsLimitExceeded: z.boolean(),
    timeColumnsLimit: z.number().int(),
    timeColumnsLength: z.number().int(),
    draftCreatedTs: z.number().int(),
    chart: zMconfigChart,
    serverTs: z.number().int()
  })
  .meta({ id: 'Report' });

export type Report = z.infer<typeof zReport>;
