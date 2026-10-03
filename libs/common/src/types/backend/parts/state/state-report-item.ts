import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StateReportItem = { reportId: string; url: string };

export let zStateReportItem = z
  .object({
    reportId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateReportItem' });

assertTypesEqual<StateReportItem, z.infer<typeof zStateReportItem>>({
  value: true
});
