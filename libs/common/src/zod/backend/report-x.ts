import { z } from 'zod';
import { zFilterX } from '#common/zod/backend/filter-x';
import { zReport } from '#common/zod/blockml/report';

export let zReportX = zReport
  .extend({
    extendedFilters: z.array(zFilterX),
    author: z.string(),
    canEditOrDeleteReport: z.boolean(),
    metricsStartDateYYYYMMDD: z.string(),
    metricsEndDateExcludedYYYYMMDD: z.string(),
    metricsEndDateIncludedYYYYMMDD: z.string()
  })
  .meta({ id: 'ReportX' });

export type ReportX = z.infer<typeof zReportX>;
