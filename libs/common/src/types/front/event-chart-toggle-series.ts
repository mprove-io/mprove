import { z } from 'zod';

export let zEventChartToggleSeries = z
  .object({
    seriesDataRowId: z.string(),
    seriesDataField: z.string()
  })
  .meta({ id: 'EventChartToggleSeries' });

export type EventChartToggleSeries = z.infer<typeof zEventChartToggleSeries>;
