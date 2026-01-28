import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

export const UI_CHART_TYPES = {
  //
  // data
  //
  sizeField: [ChartTypeEnum.Scatter],
  xField: [
    ChartTypeEnum.Line,
    ChartTypeEnum.Bar,
    ChartTypeEnum.Scatter,
    ChartTypeEnum.Pie
  ],
  yField: [ChartTypeEnum.Pie, ChartTypeEnum.Single],
  yFields: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter],
  nullableMultiField: [ChartTypeEnum.Scatter],
  multiField: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter],
  //
  // options
  //
  format: [ChartTypeEnum.Table],
  xAxisGroup: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter],
  xAxis: {
    scale: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter]
  },
  yAxisGroup: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter],
  yAxis: {
    scale: [ChartTypeEnum.Line, ChartTypeEnum.Bar, ChartTypeEnum.Scatter]
  },
  seriesGroup: [
    ChartTypeEnum.Line,
    ChartTypeEnum.Bar,
    ChartTypeEnum.Scatter,
    ChartTypeEnum.Pie
  ]
};
