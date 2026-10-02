import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zColumn } from '#common/types/blockml/parts/column';
import { zFraction } from '#common/types/blockml/parts/fraction';
import { zMconfigChart } from '#common/types/blockml/parts/mconfig-chart';
import { zReportField } from '#common/types/blockml/parts/report-field';
import { zRow } from '#common/types/blockml/parts/row';
import { zAccessRoleCombined } from '#common/types/shared/access-role-combined';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

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
