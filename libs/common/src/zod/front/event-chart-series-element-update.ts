import { z } from 'zod';
import { zMconfigChartSeries } from '#common/zod/blockml/mconfig-chart-series';

export let zEventChartSeriesElementUpdate = z
  .object({
    seriesDataRowId: z.string(),
    seriesDataField: z.string(),
    seriesPart: zMconfigChartSeries
  })
  .meta({ id: 'EventChartSeriesElementUpdate' });

export type EventChartSeriesElementUpdate = z.infer<
  typeof zEventChartSeriesElementUpdate
>;
