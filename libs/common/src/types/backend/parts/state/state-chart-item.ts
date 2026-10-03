import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StateChartItem = { chartId: string; url: string };

export let zStateChartItem = z
  .object({
    chartId: z.string(),
    url: z.string()
  })
  .meta({ id: 'StateChartItem' });

assertTypesEqual<StateChartItem, z.infer<typeof zStateChartItem>>({
  value: true
});
