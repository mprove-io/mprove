import {
  DEFAULT_CHART_SERIES_BAR,
  DEFAULT_CHART_SERIES_LINE,
  DEFAULT_CHART_SERIES_PIE,
  DEFAULT_CHART_SERIES_SCATTER,
  Mconfig,
  MconfigChart,
  MconfigChartSeries,
  ModelField,
  isDefined,
  makeCopy
} from '~common/_index';
import { enums } from '~common/barrels/enums';

export function setChartFields<T extends Mconfig>(item: {
  oldChartType?: enums.ChartTypeEnum;
  newChartType?: enums.ChartTypeEnum;
  mconfig: T;
  fields: ModelField[];
}) {
  let { oldChartType, newChartType, mconfig, fields } = item;

  if (
    oldChartType === enums.ChartTypeEnum.Scatter &&
    newChartType !== enums.ChartTypeEnum.Scatter
  ) {
    mconfig.chart.xField = undefined;
    mconfig.chart.yFields = [];
  }

  if (mconfig.select.length > 0) {
    let selectedDimensionsResultIsNumberOrTs: string[] = [];
    let selectedDimensionsResultIsNotNumberOrTs: string[] = [];

    let selectedMCsResultIsNumber: string[] = [];
    let selectedMCsResultIsNotNumber: string[] = [];

    mconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === enums.FieldClassEnum.Dimension) {
        if (
          field.result === enums.FieldResultEnum.Number ||
          field.result === enums.FieldResultEnum.Ts
        ) {
          selectedDimensionsResultIsNumberOrTs.push(field.id);
        } else {
          selectedDimensionsResultIsNotNumberOrTs.push(field.id);
        }
      } else if (
        field.fieldClass === enums.FieldClassEnum.Measure ||
        field.fieldClass === enums.FieldClassEnum.Calculation
      ) {
        if (field.result === enums.FieldResultEnum.Number) {
          selectedMCsResultIsNumber.push(field.id);
        } else {
          selectedMCsResultIsNotNumber.push(field.id);
        }
      }
    });

    let selectedDimensions = [
      ...selectedDimensionsResultIsNumberOrTs,
      ...selectedDimensionsResultIsNotNumberOrTs
    ];

    let selectedMCs = [
      ...selectedMCsResultIsNumber,
      ...selectedMCsResultIsNotNumber
    ];

    let xField =
      isDefined(mconfig.chart.xField) &&
      mconfig.select.indexOf(mconfig.chart.xField) > -1
        ? mconfig.chart.xField
        : selectedDimensionsResultIsNumberOrTs.length > 0
        ? selectedDimensionsResultIsNumberOrTs[0]
        : selectedDimensionsResultIsNotNumberOrTs.length > 0
        ? selectedDimensionsResultIsNotNumberOrTs[0]
        : undefined;

    let sizeField =
      isDefined(mconfig.chart.sizeField) &&
      mconfig.select.indexOf(mconfig.chart.sizeField) > -1
        ? mconfig.chart.sizeField
        : undefined;

    let yFields =
      mconfig.chart.yFields?.length > 0 &&
      mconfig.chart.yFields.every(x => mconfig.select.includes(x))
        ? mconfig.chart.yFields
        : selectedMCsResultIsNumber;

    let multiField =
      isDefined(mconfig.chart.multiField) &&
      mconfig.select.indexOf(mconfig.chart.multiField) > -1 &&
      mconfig.chart.multiField !== xField
        ? mconfig.chart.multiField
        : selectedDimensions.length === 2
        ? selectedDimensions.filter(x => x !== xField)[0]
        : undefined;

    let series = makeCopy(mconfig.chart.series);

    if (newChartType !== enums.ChartTypeEnum.Table) {
      series = series.filter(s => yFields.indexOf(s.dataField) > -1);

      let seriesIds = series.map(s => s.dataField);

      yFields.forEach(y => {
        if (seriesIds.indexOf(y) < 0) {
          let newSeries: MconfigChartSeries =
            newChartType === enums.ChartTypeEnum.Line
              ? DEFAULT_CHART_SERIES_LINE
              : newChartType === enums.ChartTypeEnum.Bar
              ? DEFAULT_CHART_SERIES_BAR
              : newChartType === enums.ChartTypeEnum.Scatter
              ? DEFAULT_CHART_SERIES_SCATTER
              : newChartType === enums.ChartTypeEnum.Pie
              ? DEFAULT_CHART_SERIES_PIE
              : DEFAULT_CHART_SERIES_LINE;

          newSeries.dataField = y;
          series.push(newSeries);
        }
      });
    }

    mconfig.chart = Object.assign({}, mconfig.chart, <MconfigChart>{
      xField: xField,
      yFields: yFields,
      multiField: multiField,
      sizeField: sizeField,
      series: series
    });
  }

  return mconfig;
}
