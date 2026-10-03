import type { MconfigField } from '#common/types/backend/parts/mconfig-field';
import type { MconfigChartSeries } from '#common/types/blockml/parts/mconfig-chart-series';
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
