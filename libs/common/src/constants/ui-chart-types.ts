import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

type UiChartTypes = {
  sizeField: ChartType[];
  xField: ChartType[];
  yField: ChartType[];
  yFields: ChartType[];
  nullableMultiField: ChartType[];
  multiField: ChartType[];
  pivotRows: ChartType[];
  pivotColumns: ChartType[];
  pivotValues: ChartType[];
  format: ChartType[];
  pivot: ChartType[];
  xAxisGroup: ChartType[];
  xAxis: { scale: ChartType[] };
  yAxisGroup: ChartType[];
  yAxis: { scale: ChartType[] };
  seriesGroup: ChartType[];
};

export const UI_CHART_TYPES: UiChartTypes = {
  //
  // data
  //
  sizeField: ['scatter'],
  xField: ['line', 'bar', 'scatter', 'pie'],
  yField: ['pie', 'single'],
  yFields: ['line', 'bar', 'scatter'],
  nullableMultiField: ['scatter'],
  multiField: ['line', 'bar', 'scatter'],
  pivotRows: ['pivot_table'],
  pivotColumns: ['pivot_table'],
  pivotValues: ['pivot_table'],
  //
  // options
  //
  format: ['table'],
  pivot: ['pivot_table'],
  xAxisGroup: ['line', 'bar', 'scatter'],
  xAxis: {
    scale: ['line', 'bar', 'scatter']
  },
  yAxisGroup: ['line', 'bar', 'scatter'],
  yAxis: {
    scale: ['line', 'bar', 'scatter']
  },
  seriesGroup: ['line', 'bar', 'scatter', 'pie']
};
