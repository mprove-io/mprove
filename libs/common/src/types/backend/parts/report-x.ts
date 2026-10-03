import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type FilterX, zFilterX } from '#common/types/backend/parts/filter-x';
import { type Report, zReport } from '#common/types/blockml/parts/report';
import type { Extend } from '#common/types/extend';

export type ReportX = Extend<
  Report,
  {
    extendedFilters: FilterX[];
    author: string;
    canEditOrDeleteReport: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateExcludedYYYYMMDD: string;
    metricsEndDateIncludedYYYYMMDD: string;
  }
>;

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

assertTypesEqual<ReportX, z.infer<typeof zReportX>>({ value: true });
