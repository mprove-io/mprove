import { common } from '~front/barrels/common';

export function getSelectValid(item: {
  chart: common.MconfigChart;
  mconfigFields: common.MconfigField[];
}) {
  let { chart, mconfigFields } = item;

  let xField = mconfigFields.find(f => f.id === chart.xField);
  let sizeField = mconfigFields.find(f => f.id === chart.sizeField);

  let yFieldsIsOk = true;

  if (common.isDefined(chart.yFields)) {
    let yFields = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1);

    let yFieldsResultIsNumber = yFields.filter(
      f => f.result === common.FieldResultEnum.Number
    );

    if (yFields.length !== yFieldsResultIsNumber.length) {
      yFieldsIsOk = false;
    }
  }

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = mconfigFields.filter(
    x => x.fieldClass === common.FieldClassEnum.Dimension
  );

  let selectedDimensionsResultForXField = mconfigFields.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Dimension &&
      (x.result === common.FieldResultEnum.Number ||
        x.result === common.FieldResultEnum.Ts ||
        x.result === common.FieldResultEnum.DayOfWeek ||
        x.result === common.FieldResultEnum.DayOfWeekIndex ||
        x.result === common.FieldResultEnum.MonthName ||
        x.result === common.FieldResultEnum.QuarterOfYear)
  );

  let selectedMeasuresAndCalculations = mconfigFields.filter(
    x =>
      x.fieldClass === common.FieldClassEnum.Measure ||
      x.fieldClass === common.FieldClassEnum.Calculation
  );

  if (chart.type === common.ChartTypeEnum.Table) {
    //
  } else if (
    chart.type === common.ChartTypeEnum.Pie ||
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
  } else if (
    chart.type === common.ChartTypeEnum.Line ||
    chart.type === common.ChartTypeEnum.Bar ||
    chart.type === common.ChartTypeEnum.Scatter
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (
      selectedDimensions.length > 2 &&
      chart.type !== common.ChartTypeEnum.Scatter
    ) {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type';
    } else if (
      selectedDimensionsResultForXField.length === 0 &&
      chart.type === common.ChartTypeEnum.Line
    ) {
      isSelectValid = false;
      errorMessage =
        'At least one of the selected dimensions for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      common.isDefined(xField) &&
      xField.result !== common.FieldResultEnum.Number &&
      xField.result !== common.FieldResultEnum.Ts &&
      xField.result !== common.FieldResultEnum.DayOfWeek &&
      xField.result !== common.FieldResultEnum.DayOfWeekIndex &&
      xField.result !== common.FieldResultEnum.MonthName &&
      xField.result !== common.FieldResultEnum.QuarterOfYear &&
      chart.type === common.ChartTypeEnum.Line
    ) {
      isSelectValid = false;
      errorMessage =
        'xField for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      selectedDimensions.length === 2 &&
      selectedDimensions[0].topId === selectedDimensions[1].topId &&
      selectedDimensions[0].groupId === selectedDimensions[1].groupId &&
      selectedDimensions[0].result === common.FieldResultEnum.Ts &&
      selectedDimensions[1].result === common.FieldResultEnum.Ts
    ) {
      isSelectValid = false;
      errorMessage =
        'Two dimensions with result type TS from the same time group can be selected simultaneously only for the table chart';
    } else if (
      selectedMeasuresAndCalculations.length === 0 &&
      chart.type !== common.ChartTypeEnum.Scatter
    ) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    } else if (
      common.isDefined(sizeField) &&
      sizeField.result !== common.FieldResultEnum.Number
    ) {
      isSelectValid = false;
      errorMessage =
        'sizeField for this chart type must have result type "number"';
    } else if (yFieldsIsOk === false) {
      isSelectValid = false;
      errorMessage =
        'Each element of yFields for this chart type must have result type "number"';
    }
  }

  return { isSelectValid: isSelectValid, errorMessage: errorMessage };
}
