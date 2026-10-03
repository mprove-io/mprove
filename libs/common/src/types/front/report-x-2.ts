import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type ReportX, zReportX } from '#common/types/backend/parts/report-x';
import type { Extend } from '#common/types/extend';
import { type RowX2, zRowX2 } from '#common/types/front/row-x-2';

export type ReportX2 = Extend<ReportX, { rows: RowX2[] }>;

export let zReportX2 = zReportX
  .extend({
    rows: z.array(zRowX2)
  })
  .meta({ id: 'ReportX2' });

assertTypesEqual<ReportX2, z.infer<typeof zReportX2>>({ value: true });
