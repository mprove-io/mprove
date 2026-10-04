export const UI_CHART_TYPES = {
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
