import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EventChartToggleYAxisElement = { yAxisIndex: number };

export let zEventChartToggleYAxisElement = z
  .object({
    yAxisIndex: z.number()
  })
  .meta({ id: 'EventChartToggleYAxisElement' });

assertTypesEqual<
  EventChartToggleYAxisElement,
  z.infer<typeof zEventChartToggleYAxisElement>
>({ value: true });
