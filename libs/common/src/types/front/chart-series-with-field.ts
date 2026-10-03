import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigField,
  zMconfigField
} from '#common/types/backend/parts/mconfig-field';
import {
  type MconfigChartSeries,
  zMconfigChartSeries
} from '#common/types/blockml/parts/mconfig-chart-series';
import type { Extend } from '#common/types/extend';

export type ChartSeriesWithField = Extend<
  MconfigChartSeries,
  {
    field: MconfigField;
    isMetric: boolean;
    showMetricsModelName: boolean;
    showMetricsTimeFieldName: boolean;
    seriesName: string;
    seriesRowName: string;
    partNodeLabel: string;
    partFieldLabel: string;
    timeNodeLabel: string;
    timeFieldLabel: string;
    topLabel: string;
  }
>;

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

assertTypesEqual<ChartSeriesWithField, z.infer<typeof zChartSeriesWithField>>({
  value: true
});
