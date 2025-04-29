import { enums } from '~common/barrels/enums';

export const UI_CHART_TYPES = {
  //
  // data
  //
  hideColumns: [enums.ChartTypeEnum.Table],
  sizeField: [enums.ChartTypeEnum.Scatter],
  xField: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter,
    enums.ChartTypeEnum.Pie
  ],
  yField: [enums.ChartTypeEnum.Pie, enums.ChartTypeEnum.Single],
  yFields: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter
  ],
  nullableMultiField: [enums.ChartTypeEnum.Scatter],
  multiField: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter
  ],
  //
  // options
  //
  format: [enums.ChartTypeEnum.Table],
  pageSize: [enums.ChartTypeEnum.Table],
  xAxisGroup: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter
  ],
  xAxis: {
    scale: [
      enums.ChartTypeEnum.Line,
      enums.ChartTypeEnum.Bar,
      enums.ChartTypeEnum.Scatter
    ]
  },
  yAxisGroup: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter
  ],
  yAxis: {
    scale: [
      enums.ChartTypeEnum.Line,
      enums.ChartTypeEnum.Bar,
      enums.ChartTypeEnum.Scatter
    ]
  },
  seriesGroup: [
    enums.ChartTypeEnum.Line,
    enums.ChartTypeEnum.Bar,
    enums.ChartTypeEnum.Scatter,
    enums.ChartTypeEnum.Pie
  ]
};
