import type { MconfigChartSeries } from '#common/types/blockml/parts/mconfig/mconfig-chart-series';

export type EventChartSeriesElementUpdate = {
  seriesDataRowId: string;
  seriesDataField: string;
  seriesPart: MconfigChartSeries;
};
