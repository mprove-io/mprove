import { MconfigChartSeries } from '#common/interfaces/blockml/mconfig-chart-series';

export class EventChartSeriesElementUpdate {
  seriesDataRowId: string;
  seriesDataField: string;
  seriesPart: MconfigChartSeries;
}
