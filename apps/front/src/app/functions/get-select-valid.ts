import { common } from '~front/barrels/common';
import { ColumnField } from '../queries/mq.query';

export function getSelectValid(item: {
  chartType: common.ChartTypeEnum;
  sortedColumns: ColumnField[];
}) {
  let { chartType, sortedColumns } = item;

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = sortedColumns.filter(
    x => x.fieldClass === common.FieldClassEnum.Dimension
  );

  let selectedMeasuresAndCalculations = sortedColumns.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Measure ||
      x.fieldClass === common.FieldClassEnum.Calculation
  );

  if (chartType === common.ChartTypeEnum.Table) {
    //
  } else if (
    chartType === common.ChartTypeEnum.BarVertical ||
    chartType === common.ChartTypeEnum.BarHorizontal ||
    chartType === common.ChartTypeEnum.Pie ||
    chartType === common.ChartTypeEnum.PieAdvanced ||
    chartType === common.ChartTypeEnum.PieGrid ||
    chartType === common.ChartTypeEnum.TreeMap ||
    chartType === common.ChartTypeEnum.Gauge
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
  } else if (chartType === common.ChartTypeEnum.NumberCard) {
    if (selectedDimensions.length > 1) {
      isSelectValid = false;
      errorMessage =
        'Only one Dimension field can be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chartType === common.ChartTypeEnum.GaugeLinear) {
    if (selectedDimensions.length > 0) {
      isSelectValid = false;
      errorMessage = 'Dimension fields can not be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (
    chartType === common.ChartTypeEnum.BarVerticalGrouped ||
    chartType === common.ChartTypeEnum.BarHorizontalGrouped ||
    chartType === common.ChartTypeEnum.BarVerticalStacked ||
    chartType === common.ChartTypeEnum.BarHorizontalStacked ||
    chartType === common.ChartTypeEnum.BarVerticalNormalized ||
    chartType === common.ChartTypeEnum.BarHorizontalNormalized ||
    chartType === common.ChartTypeEnum.Line ||
    chartType === common.ChartTypeEnum.Area ||
    chartType === common.ChartTypeEnum.AreaStacked ||
    chartType === common.ChartTypeEnum.AreaNormalized ||
    chartType === common.ChartTypeEnum.HeatMap
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (selectedDimensions.length > 2) {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type.';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  }

  return { isSelectValid: isSelectValid, errorMessage: errorMessage };
}
