import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MconfigChartPivotValue = { field: string };

export let zMconfigChartPivotValue = z
  .object({
    field: z.string()
  })
  .meta({ id: 'MconfigChartPivotValue' });

assertTypesEqual<
  MconfigChartPivotValue,
  z.infer<typeof zMconfigChartPivotValue>
>({ value: true });
