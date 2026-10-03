import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EventChartDeleteYAxisElement = { yAxisIndex: number };

export let zEventChartDeleteYAxisElement = z
  .object({
    yAxisIndex: z.number()
  })
  .meta({ id: 'EventChartDeleteYAxisElement' });

assertTypesEqual<
  EventChartDeleteYAxisElement,
  z.infer<typeof zEventChartDeleteYAxisElement>
>({ value: true });
