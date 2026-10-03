import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MconfigChartYAxis = { scale: boolean };

export let zMconfigChartYAxis = z
  .object({
    scale: z.boolean()
  })
  .meta({ id: 'MconfigChartYAxis' });

assertTypesEqual<MconfigChartYAxis, z.infer<typeof zMconfigChartYAxis>>({
  value: true
});
