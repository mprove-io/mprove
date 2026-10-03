import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EventChartToggleSeries = {
  seriesDataRowId: string;
  seriesDataField: string;
};

export let zEventChartToggleSeries = z
  .object({
    seriesDataRowId: z.string(),
    seriesDataField: z.string()
  })
  .meta({ id: 'EventChartToggleSeries' });

assertTypesEqual<
  EventChartToggleSeries,
  z.infer<typeof zEventChartToggleSeries>
>({ value: true });
