import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { zColumn } from '#common/zod/blockml/column';
import { zFraction } from '#common/zod/blockml/fraction';
import { zMconfigChart } from '#common/zod/blockml/mconfig-chart';
import { zReportField } from '#common/zod/blockml/report-field';
import { zRow } from '#common/zod/blockml/row';

export let zReport = z
  .object({
    projectId: z.string(),
    structId: z.string(),
    reportId: z.string(),
    draft: z.boolean(),
    creatorId: z.string(),
    filePath: z.string(),
    fields: z.array(zReportField),
    accessRoles: z.array(z.string()),
    title: z.string(),
    timezone: z.string(),
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
