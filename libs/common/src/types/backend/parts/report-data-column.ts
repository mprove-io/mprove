import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ReportDataColumn = {
  id: number;
  fields?: { timestamp: number } & Record<string, any>;
};

export let zReportDataColumn = z
  .object({
    id: z.number(),
    fields: z.intersection(
      z.object({ timestamp: z.number() }),
      z.record(z.string(), z.any())
    )
  })
  .meta({ id: 'ReportDataColumn' });

assertTypesEqual<ReportDataColumn, z.infer<typeof zReportDataColumn>>({
  value: true
});
