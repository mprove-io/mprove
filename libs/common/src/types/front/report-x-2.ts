import { z } from 'zod';
import { zReportX } from '#common/types/backend/parts/report-x';
import { zRowX2 } from '#common/types/front/row-x-2';

export let zReportX2 = zReportX
  .extend({
    rows: z.array(zRowX2)
  })
  .meta({ id: 'ReportX2' });

export type ReportX2 = z.infer<typeof zReportX2>;
