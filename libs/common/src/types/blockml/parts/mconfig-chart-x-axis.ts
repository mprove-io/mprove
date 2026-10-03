import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MconfigChartXAxis = { scale: boolean };

export let zMconfigChartXAxis = z
  .object({
    scale: z.boolean()
  })
  .meta({ id: 'MconfigChartXAxis' });

assertTypesEqual<MconfigChartXAxis, z.infer<typeof zMconfigChartXAxis>>({
  value: true
});
