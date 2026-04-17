import { z } from 'zod';
import { zMconfigField } from '#common/zod/backend/mconfig-field';
import { zMconfigChartSeries } from '#common/zod/blockml/mconfig-chart-series';

export let zChartSeriesWithField = zMconfigChartSeries
  .extend({
    field: zMconfigField,
    isMetric: z.boolean(),
    showMetricsModelName: z.boolean(),
    showMetricsTimeFieldName: z.boolean(),
    seriesName: z.string(),
    seriesRowName: z.string(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    timeNodeLabel: z.string(),
    timeFieldLabel: z.string(),
    topLabel: z.string()
  })
  .meta({ id: 'ChartSeriesWithField' });

export type ChartSeriesWithField = z.infer<typeof zChartSeriesWithField>;
