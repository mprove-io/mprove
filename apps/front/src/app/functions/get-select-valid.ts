import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { MconfigField } from '#common/interfaces/backend/mconfig-field';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';

export function getSelectValid(item: {
  chart: MconfigChart;
  mconfigFields: MconfigField[];
  isStoreModel: boolean;
}) {
  let { chart, mconfigFields, isStoreModel } = item;

  let xField = mconfigFields.find(f => f.id === chart.xField);
  let sizeField = mconfigFields.find(f => f.id === chart.sizeField);

  let yFieldsIsOk = true;

  if (isDefined(chart.yFields)) {
    let yFields = mconfigFields.filter(f => chart.yFields.indexOf(f.id) > -1);

    let yFieldsResultIsNumber = yFields.filter(
      f => f.result === FieldResultEnum.Number
    );

    if (yFields.length !== yFieldsResultIsNumber.length) {
      yFieldsIsOk = false;
    }
  }

  let isSelectValid = true;
  let errorMessage;

  let selectedDimensions = mconfigFields.filter(
    x => x.fieldClass === FieldClassEnum.Dimension
  );

  let selectedDimensionsResultForXField = mconfigFields.filter(
    x =>
      x.fieldClass === FieldClassEnum.Dimension &&
      ((isStoreModel === true && isDefined(x.detail)) ||
        x.result === FieldResultEnum.Number ||
        x.result === FieldResultEnum.Ts ||
        x.result === FieldResultEnum.DayOfWeek ||
        x.result === FieldResultEnum.DayOfWeekIndex ||
        x.result === FieldResultEnum.MonthName ||
        x.result === FieldResultEnum.QuarterOfYear)
  );

  let selectedMeasuresAndCalculations = mconfigFields.filter(
    x =>
      x.fieldClass === FieldClassEnum.Measure ||
      x.fieldClass === FieldClassEnum.Calculation
  );

  if (chart.type === ChartTypeEnum.Table) {
    //
  } else if (chart.type === ChartTypeEnum.Single) {
    if (selectedDimensions.length > 0) {
      isSelectValid = false;
      errorMessage = 'Dimensions cannot be selected for this chart type';
    } else if (selectedMeasuresAndCalculations.length === 0) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    }
  } else if (chart.type === ChartTypeEnum.Pie) {
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
    chart.type === ChartTypeEnum.Line ||
    chart.type === ChartTypeEnum.Bar ||
    chart.type === ChartTypeEnum.Scatter
  ) {
    if (selectedDimensions.length === 0) {
      isSelectValid = false;
      errorMessage = 'Dimension field must be selected for this chart type';
    } else if (
      selectedDimensions.length > 2 &&
      chart.type !== ChartTypeEnum.Scatter
    ) {
      isSelectValid = false;
      errorMessage =
        'A maximum of 2 dimension fields can be selected for this chart type';
    } else if (
      selectedDimensionsResultForXField.length === 0 &&
      chart.type === ChartTypeEnum.Line
    ) {
      isSelectValid = false;
      errorMessage =
        'At least one of the selected dimensions for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      isDefined(xField) &&
      isStoreModel === true &&
      isUndefined(xField.detail) &&
      xField.result !== FieldResultEnum.Number &&
      xField.result !== FieldResultEnum.Ts &&
      xField.result !== FieldResultEnum.DayOfWeek &&
      xField.result !== FieldResultEnum.DayOfWeekIndex &&
      xField.result !== FieldResultEnum.MonthName &&
      xField.result !== FieldResultEnum.QuarterOfYear &&
      chart.type === ChartTypeEnum.Line
    ) {
      isSelectValid = false;
      errorMessage =
        isStoreModel === true
          ? 'xField for this chart type must have result type "number" or time_group with detail specified'
          : 'xField for this chart type must have result type "number", "ts", "day_of_week", "day_of_week_index", "month_name", "quarter_of_year"';
    } else if (
      selectedDimensions.length === 2 &&
      selectedDimensions[0].topId === selectedDimensions[1].topId &&
      selectedDimensions[0].groupId === selectedDimensions[1].groupId &&
      (selectedDimensions[0].result === FieldResultEnum.Ts ||
        (isStoreModel === true && isDefined(selectedDimensions[0].detail))) &&
      (selectedDimensions[1].result === FieldResultEnum.Ts ||
        (isStoreModel === true && isDefined(selectedDimensions[1].detail)))
    ) {
      isSelectValid = false;
      errorMessage =
        isStoreModel === true
          ? 'Two dimensions with detail specified from the same time group can be selected simultaneously only for the table chart'
          : 'Two dimensions with result type TS from the same time group can be selected simultaneously only for the table chart';
    } else if (
      selectedMeasuresAndCalculations.length === 0 &&
      chart.type !== ChartTypeEnum.Scatter
    ) {
      isSelectValid = false;
      errorMessage =
        'Measure or Calculation field must be selected for this chart type';
    } else if (
      isDefined(sizeField) &&
      sizeField.result !== FieldResultEnum.Number
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
