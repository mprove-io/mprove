import { common } from '~front/barrels/common';
import { ColumnField } from '../queries/mq.query';

export function getSelectValid(item: {
  chart: common.Chart;
  sortedColumns: ColumnField[];
}) {
  let { chart, sortedColumns } = item;

  let xField = sortedColumns.find(f => f.id === chart.xField);

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = sortedColumns.filter(
    x => x.fieldClass === common.FieldClassEnum.Dimension
  );

  let selectedDimensionsIsResultNumberOrTs = sortedColumns.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Dimension &&
      (x.result === common.FieldResultEnum.Number ||
        x.result === common.FieldResultEnum.Ts)
  );

  let selectedMeasuresAndCalculations = sortedColumns.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Measure ||
      x.fieldClass === common.FieldClassEnum.Calculation
  );

  if (chart.type === common.ChartTypeEnum.Table) {
    //
  } else if (
    chart.type === common.ChartTypeEnum.BarVertical ||
    chart.type === common.ChartTypeEnum.BarHorizontal ||
    chart.type === common.ChartTypeEnum.Pie ||
    chart.type === common.ChartTypeEnum.PieAdvanced ||
    chart.type === common.ChartTypeEnum.PieGrid ||
    chart.type === common.ChartTypeEnum.TreeMap ||
    chart.type === common.ChartTypeEnum.Gauge
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 1) {
      isSelectValid = false;
      errorMessage =
        'Only one Dimension field must be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === common.ChartTypeEnum.NumberCard) {
    if (selectedDimensions.length > 1) {
      isSelectValid = false;
      errorMessage =
        'Only one Dimension field can be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === common.ChartTypeEnum.GaugeLinear) {
    if (selectedDimensions.length > 0) {
      isSelectValid = false;
      errorMessage = 'Dimension fields can not be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (
    chart.type === common.ChartTypeEnum.BarVerticalGrouped ||
    chart.type === common.ChartTypeEnum.BarHorizontalGrouped ||
    chart.type === common.ChartTypeEnum.BarVerticalStacked ||
    chart.type === common.ChartTypeEnum.BarHorizontalStacked ||
    chart.type === common.ChartTypeEnum.BarVerticalNormalized ||
    chart.type === common.ChartTypeEnum.BarHorizontalNormalized ||
    chart.type === common.ChartTypeEnum.Line ||
    chart.type === common.ChartTypeEnum.Area ||
    chart.type === common.ChartTypeEnum.AreaStacked ||
    chart.type === common.ChartTypeEnum.AreaNormalized ||
    chart.type === common.ChartTypeEnum.HeatMap
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 2) {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type';
    } else if (
      selectedDimensionsIsResultNumberOrTs.length === 0 &&
      (chart.type === common.ChartTypeEnum.Line ||
        chart.type === common.ChartTypeEnum.Area ||
        chart.type === common.ChartTypeEnum.AreaStacked ||
        chart.type === common.ChartTypeEnum.AreaNormalized)
    ) {
      isSelectValid = false;
      errorMessage =
        'At least one of the selected dimensions for this chart type must have result type "number" or "ts"';
    } else if (
      xField.result !== common.FieldResultEnum.Ts &&
      xField.result !== common.FieldResultEnum.Number &&
      (chart.type === common.ChartTypeEnum.Line ||
        chart.type === common.ChartTypeEnum.Area ||
        chart.type === common.ChartTypeEnum.AreaStacked ||
        chart.type === common.ChartTypeEnum.AreaNormalized)
    ) {
      isSelectValid = false;
      errorMessage =
        'xField for this chart type must have result type "number" or "ts"';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  }

  return { isSelectValid: isSelectValid, errorMessage: errorMessage };
}
